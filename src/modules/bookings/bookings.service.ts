import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { PaginatedResponse } from '../../common';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { BookingStatsResponseDto } from './dto/booking-stats-response.dto';
import { UserRole } from '../users/entities/user.entity';

type CurrentUserPayload = {
  id: string;
  role: string;
};

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
  ) {}

  async getMyBookings(
    userId: string,
    query: QueryBookingsDto,
  ): Promise<PaginatedResponse<Order>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.ordersRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.payment', 'payment')
      .where('order.userId = :userId', { userId })
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    this.applyFilters(qb, query);

    // payment is 1-1 => safe count without distinct problems
    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  async getBookingDetails(
    bookingId: string,
    currentUser: CurrentUserPayload,
  ): Promise<Order> {
    const order = await this.ordersRepo.findOne({
      where: { id: bookingId },
      relations: ['orderItems', 'payment'],
    });

    if (!order) {
      throw new NotFoundException(`Booking with id "${bookingId}" not found`);
    }

    const isAdmin = currentUser.role === UserRole.ADMIN;
    if (!isAdmin && order.userId !== currentUser.id) {
      throw new ForbiddenException('You are not allowed to view this booking');
    }

    return order;
  }

  async getAdminBookings(
    query: QueryBookingsDto,
  ): Promise<PaginatedResponse<Order>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.ordersRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.payment', 'payment')
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    this.applyFilters(qb, query);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  async getAdminBookingsStats(
    query: QueryBookingsDto,
  ): Promise<BookingStatsResponseDto> {
    // If status is provided, stats will reflect that status only.
    const qbGroup = this.ordersRepo
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .addSelect('SUM(order.totalAmount)', 'totalAmount')
      .groupBy('order.status');

    this.applyFilters(qbGroup, query);

    const rows = await qbGroup.getRawMany<{
      status: OrderStatus;
      count: string;
      totalAmount: string | null;
    }>();

    const qbTotal = this.ordersRepo
      .createQueryBuilder('order')
      .select('COUNT(order.id)', 'totalOrders')
      .addSelect('SUM(order.totalAmount)', 'totalRevenue');

    this.applyFilters(qbTotal, query);

    const totalRow = await qbTotal.getRawOne<{
      totalOrders: string;
      totalRevenue: string | null;
    }>();

    const statusStats = rows
      .map((r) => ({
        status: r.status,
        count: Number(r.count),
        totalAmount: Number(r.totalAmount ?? 0),
      }))
      .sort((a, b) => a.status.localeCompare(b.status));

    const paidRow = rows.find((r) => r.status === OrderStatus.PAID);
    const paidOrders = Number(paidRow?.count ?? 0);
    const paidRevenue = Number(paidRow?.totalAmount ?? 0);

    return {
      totalOrders: Number(totalRow?.totalOrders ?? 0),
      totalRevenue: Number(totalRow?.totalRevenue ?? 0),
      paidOrders,
      paidRevenue,
      statusStats,
    };
  }

  private applyFilters(
    qb: any,
    query: QueryBookingsDto,
  ): void {
    if (query.status) {
      qb.andWhere('order.status = :status', { status: query.status });
    }

    if (query.fromDate) {
      qb.andWhere('order.createdAt >= :fromDate', {
        fromDate: new Date(query.fromDate),
      });
    }

    if (query.toDate) {
      qb.andWhere('order.createdAt <= :toDate', {
        toDate: new Date(query.toDate),
      });
    }
  }
}


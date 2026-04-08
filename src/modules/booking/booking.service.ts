import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { PaginatedResponse } from 'src/common';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Order)
    private readonly bookingsRepo: Repository<Order>,
  ) {}

  async findAllPaged(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<Order>> {
    const skip = (page - 1) * limit;
    const [items, total] = await this.bookingsRepo.findAndCount({
      relations: ['orderItems'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return this.bookingsRepo.find({
      where: {
        userId,
      },
      relations: ['orderItems'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Order> {
    const booking = await this.bookingsRepo.findOne({
      where: { id },
      relations: ['orderItems'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with id "${id}" not found`);
    }

    return booking;
  }
}

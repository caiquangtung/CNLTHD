import {
  Controller,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { BookingsService } from './bookings.service';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { PaginatedResponse } from '../../common';
import { Order } from '../orders/entities/order.entity';
import { OrderDetailResponse } from './dto/order-detail-response.dto';
import { BookingStatsResponseDto } from './dto/booking-stats-response.dto';

type CurrentUserPayload = {
  id: string;
  role: UserRole | string;
};

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('bookings/my')
  async getMyBookings(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: QueryBookingsDto,
  ): Promise<PaginatedResponse<Order>> {
    return this.bookingsService.getMyBookings(user.id, query);
  }

  @Get('bookings/:id')
  async getBookingDetails(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<OrderDetailResponse> {
    return this.bookingsService.getBookingDetails(id, user);
  }

  @Get('admin/bookings')
  @Roles(UserRole.ADMIN)
  async getAdminBookings(
    @Query() query: QueryBookingsDto,
  ): Promise<PaginatedResponse<Order>> {
    return this.bookingsService.getAdminBookings(query);
  }

  @Get('admin/bookings/stats')
  @Roles(UserRole.ADMIN)
  async getAdminBookingsStats(
    @Query() query: QueryBookingsDto,
  ): Promise<BookingStatsResponseDto> {
    return this.bookingsService.getAdminBookingsStats(query);
  }
}


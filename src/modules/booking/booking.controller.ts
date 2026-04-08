import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PaginatedResponse } from 'src/common';
import { OrderResponseDto } from '../orders/dto/order-response.dto';
import {
  mapOrderToResponseDto,
  mapOrdersToResponseDto,
} from '../orders/mappers/order.mapper';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<PaginatedResponse<OrderResponseDto>> {
    const result = await this.bookingService.findAllPaged(page, limit);
    const data = mapOrdersToResponseDto(result.items);

    return {
      items: data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get('my-bookings')
  async findMyBookings(
    @CurrentUser('id') userId: string,
  ): Promise<OrderResponseDto[]> {
    const bookings = await this.bookingService.findByUserId(userId);
    return mapOrdersToResponseDto(bookings);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<OrderResponseDto> {
    const booking = await this.bookingService.findById(id);
    return mapOrderToResponseDto(booking);
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Payment } from '../payments/entities/payment.entity';
import { OrderItem } from '../orders/entities/order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Payment, OrderItem])],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}


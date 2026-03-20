/**
 * Module Events – quản lý sự kiện.
 * Tương ứng module: ticket-types/ticket-types.module.ts
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './entities/event.entity';
import { TicketTypesModule } from '../ticket-types/ticket-types.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event]), TicketTypesModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}

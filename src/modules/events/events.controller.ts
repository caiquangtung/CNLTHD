import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import {
  mapEventToResponseDto,
  mapEventsToResponseDto,
} from './mappers/event.mapper';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createEventDto: CreateEventDto,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.create(createEventDto);
    return mapEventToResponseDto(event);
  }

  @Get()
  @Public()
  async findAll(): Promise<EventResponseDto[]> {
    const events = await this.eventsService.findAll();
    return mapEventsToResponseDto(events);
  }

  @Get('deleted')
  @Roles(UserRole.ADMIN)
  async findAllWithDeleted(): Promise<EventResponseDto[]> {
    const events = await this.eventsService.findAllWithDeleted();
    return mapEventsToResponseDto(events);
  }

  @Get(':id')
  @Public()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.findById(id);
    return mapEventToResponseDto(event);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.update(id, updateEventDto);
    return mapEventToResponseDto(event);
  }

  @Patch(':id/restore')
  @Roles(UserRole.ADMIN)
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.restore(id);
    return mapEventToResponseDto(event);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.eventsService.softRemove(id);
  }
}

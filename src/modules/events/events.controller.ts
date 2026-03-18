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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { TicketTypesService } from '../ticket-types/ticket-types.service';
import { CreateTicketTypeDto } from '../ticket-types/dto/create-ticket-type.dto';
import { TicketTypeResponseDto } from '../ticket-types/dto/ticket-type-response.dto';
import {
  mapTicketTypeToResponseDto,
  mapTicketTypesToResponseDto,
} from '../ticket-types/mappers/ticket-type.mapper';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly ticketTypesService: TicketTypesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  async create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() currentUser: { id: string },
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.create(
      createEventDto,
      currentUser.id,
    );
    return mapEventToResponseDto(event);
  }

  @Get()
  @Public()
  async findAll(): Promise<EventResponseDto[]> {
    const events = await this.eventsService.findAll();
    return mapEventsToResponseDto(events);
  }

  @Get('my-events')
  async findMyEvents(
    @CurrentUser() currentUser: { id: string },
  ): Promise<EventResponseDto[]> {
    const events = await this.eventsService.findByOrganizer(currentUser.id);
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

  @Get(':id/tickets')
  @Public()
  async findTicketsByEvent(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TicketTypeResponseDto[]> {
    await this.eventsService.findById(id);
    const ticketTypes = await this.ticketTypesService.findByEvent(id);
    return mapTicketTypesToResponseDto(ticketTypes);
  }

  @Post(':id/tickets')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  async createTicketTypeForEvent(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createTicketTypeDto: CreateTicketTypeDto,
  ): Promise<TicketTypeResponseDto> {
    await this.eventsService.findById(id);

    const ticketType = await this.ticketTypesService.create({
      ...createTicketTypeDto,
      eventId: id,
    });
    return mapTicketTypeToResponseDto(ticketType);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() currentUser: { id: string; role: UserRole },
  ): Promise<EventResponseDto> {
    const event = await this.eventsService.update(
      id,
      updateEventDto,
      currentUser,
    );
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
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: { id: string; role: UserRole },
  ): Promise<void> {
    await this.eventsService.softRemove(id, currentUser);
  }
}

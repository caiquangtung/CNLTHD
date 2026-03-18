import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketResponseDto } from './dto/ticket-response.dto';
import {
  mapTicketToResponseDto,
  mapTicketsToResponseDto,
} from './mappers/ticket.mapper';
import { CurrentUser, Roles } from '../../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { UserRole } from '../users/entities/user.entity';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  async create(@Body() createTicketDto: CreateTicketDto): Promise<TicketResponseDto> {
    const ticket = await this.ticketsService.create(createTicketDto);
    return mapTicketToResponseDto(ticket);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  async findAll(): Promise<TicketResponseDto[]> {
    const tickets = await this.ticketsService.findAll();
    return mapTicketsToResponseDto(tickets);
  }

  @Get('deleted')
  @Roles(UserRole.ADMIN)
  async findAllWithDeleted(): Promise<TicketResponseDto[]> {
    const tickets = await this.ticketsService.findAllWithDeleted();
    return mapTicketsToResponseDto(tickets);
  }

  @Get('me')
  async findMyTickets(
    @CurrentUser() user: { id: string },
  ): Promise<TicketResponseDto[]> {
    const tickets = await this.ticketsService.findByUser(user.id);
    return mapTicketsToResponseDto(tickets);
  }

  @Get('order/:orderId')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  async findByOrder(
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ): Promise<TicketResponseDto[]> {
    const tickets = await this.ticketsService.findByOrder(orderId);
    return mapTicketsToResponseDto(tickets);
  }

  @Get('code/:ticketCode')
  async findByCode(
    @Param('ticketCode') ticketCode: string,
  ): Promise<TicketResponseDto> {
    const ticket = await this.ticketsService.findByCode(ticketCode);
    return mapTicketToResponseDto(ticket);
  }

  @Get(':id/qr')
  async getTicketQR(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<string> {
    return this.ticketsService.generateQrBase64(id);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TicketResponseDto> {
    const ticket = await this.ticketsService.findById(id);
    return mapTicketToResponseDto(ticket);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ): Promise<TicketResponseDto> {
    const ticket = await this.ticketsService.update(id, updateTicketDto);
    return mapTicketToResponseDto(ticket);
  }

  @Patch(':id/use')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  async markAsUsed(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TicketResponseDto> {
    const ticket = await this.ticketsService.markAsUsed(id);
    return mapTicketToResponseDto(ticket);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  async markAsCancelled(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TicketResponseDto> {
    const ticket = await this.ticketsService.markAsCancelled(id);
    return mapTicketToResponseDto(ticket);
  }

  @Patch(':id/restore')
  @Roles(UserRole.ADMIN)
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TicketResponseDto> {
    const ticket = await this.ticketsService.restore(id);
    return mapTicketToResponseDto(ticket);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.ticketsService.softRemove(id);
  }
}

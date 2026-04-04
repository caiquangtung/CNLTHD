import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import {
  applyUpdateTicketDtoToEntity,
  mapCreateTicketDtoToEntity,
} from './mappers/ticket.mapper';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepo: Repository<Ticket>,
  ) { }

  async create(dto: CreateTicketDto): Promise<Ticket> {
    const existing = await this.ticketsRepo.findOne({
      where: { ticketCode: dto.ticketCode },
    });

    if (existing) {
      throw new ConflictException(
        `Ticket code "${dto.ticketCode}" already exists`,
      );
    }

    const ticket = mapCreateTicketDtoToEntity(dto);
    return this.ticketsRepo.save(ticket);
  }

  async findAll(): Promise<Ticket[]> {
    return this.ticketsRepo.find({ order: { createdAt: 'ASC' } });
  }

  async findAllWithDeleted(): Promise<Ticket[]> {
    return this.ticketsRepo.find({
      withDeleted: true,
      order: { createdAt: 'ASC' },
    });
  }

  async findByOrder(orderId: string): Promise<Ticket[]> {
    return this.ticketsRepo.find({
      where: { orderId },
      order: { createdAt: 'ASC' },
    });
  }


  async findById(id: string): Promise<Ticket> {
    const ticket = await this.ticketsRepo.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Ticket with id "${id}" not found`);
    }
    return ticket;
  }

  async findByCode(ticketCode: string): Promise<Ticket> {
    const ticket = await this.ticketsRepo.findOne({ where: { ticketCode } });
    if (!ticket) {
      throw new NotFoundException(
        `Ticket with code "${ticketCode}" not found`,
      );
    }
    return ticket;
  }

  async generateQrBase64(id: string): Promise<string> {
    const ticket = await this.findById(id);
    return QRCode.toDataURL(ticket.qrData, { margin: 2, width: 256 });
  }

  async update(id: string, dto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findById(id);

    if (dto.ticketCode && dto.ticketCode !== ticket.ticketCode) {
      const conflict = await this.ticketsRepo.findOne({
        where: { ticketCode: dto.ticketCode },
      });
      if (conflict && conflict.id !== id) {
        throw new ConflictException(
          `Ticket code "${dto.ticketCode}" already exists`,
        );
      }
    }

    applyUpdateTicketDtoToEntity(ticket, dto);
    return this.ticketsRepo.save(ticket);
  }

  async softRemove(id: string): Promise<void> {
    const ticket = await this.findById(id);
    await this.ticketsRepo.softRemove(ticket);
  }

  async markAsUsed(id: string): Promise<Ticket> {
    const ticket = await this.findById(id);

    if (ticket.status === TicketStatus.CANCELLED) {
      throw new BadRequestException('Cancelled ticket cannot be used');
    }

    if (ticket.status === TicketStatus.USED) {
      throw new BadRequestException('Ticket is already used');
    }

    ticket.status = TicketStatus.USED;
    return this.ticketsRepo.save(ticket);
  }

  async markAsCancelled(id: string): Promise<Ticket> {
    const ticket = await this.findById(id);

    if (ticket.status === TicketStatus.USED) {
      throw new BadRequestException('Used ticket cannot be cancelled');
    }

    if (ticket.status === TicketStatus.CANCELLED) {
      throw new BadRequestException('Ticket is already cancelled');
    }

    ticket.status = TicketStatus.CANCELLED;
    return this.ticketsRepo.save(ticket);
  }

  async restore(id: string): Promise<Ticket> {
    const ticket = await this.ticketsRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with id "${id}" not found`);
    }

    if (!ticket.deletedAt) {
      throw new BadRequestException('Ticket is not deleted');
    }

    await this.ticketsRepo.restore(id);
    return this.findById(id);
  }
}


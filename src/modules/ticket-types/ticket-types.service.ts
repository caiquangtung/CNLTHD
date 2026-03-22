import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketType } from './entities/ticket-type.entity';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import {
  mapCreateTicketTypeDtoToEntity,
  applyUpdateTicketTypeDtoToEntity,
} from './mappers/ticket-type.mapper';

@Injectable()
export class TicketTypesService {
  constructor(
    @InjectRepository(TicketType)
    private ticketTypesRepo: Repository<TicketType>,
  ) {}

  async create(dto: CreateTicketTypeDto): Promise<TicketType> {
    const existing = await this.ticketTypesRepo.findOne({
      where: { eventId: dto.eventId, name: dto.name, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException(
        `Ticket type "${dto.name}" already exists for this event`,
      );
    }

    const ticketType = mapCreateTicketTypeDtoToEntity(dto);
    return this.ticketTypesRepo.save(ticketType);
  }

  async findAll(): Promise<TicketType[]> {
    return this.ticketTypesRepo.find({
      where: { deletedAt: null },
      order: { createdAt: 'ASC' },
    });
  }

  async findByEvent(eventId: string): Promise<TicketType[]> {
    return this.ticketTypesRepo.find({
      where: { eventId, deletedAt: null },
      order: { price: 'ASC' },
    });
  }

  async findById(id: string): Promise<TicketType> {
    const ticketType = await this.ticketTypesRepo.findOne({
      where: { id, deletedAt: null },
    });
    if (!ticketType) {
      throw new NotFoundException(`TicketType with id "${id}" not found`);
    }
    return ticketType;
  }

  async update(id: string, dto: UpdateTicketTypeDto): Promise<TicketType> {
    const ticketType = await this.findById(id);

    const newName = dto.name ?? ticketType.name;
    const newEventId = dto.eventId ?? ticketType.eventId;
    const nameChanged = dto.name !== undefined && dto.name !== ticketType.name;
    const eventChanged =
      dto.eventId !== undefined && dto.eventId !== ticketType.eventId;

    if (nameChanged || eventChanged) {
      const conflict = await this.ticketTypesRepo.findOne({
        where: { eventId: newEventId, name: newName, deletedAt: null },
      });
      if (conflict && conflict.id !== id) {
        throw new ConflictException(
          `Ticket type "${newName}" already exists for this event`,
        );
      }
    }

    applyUpdateTicketTypeDtoToEntity(ticketType, dto);
    return this.ticketTypesRepo.save(ticketType);
  }

  async softRemove(id: string): Promise<void> {
    const ticketType = await this.findById(id);
    await this.ticketTypesRepo.softRemove(ticketType);
  }

  async restore(id: string): Promise<TicketType> {
    const ticketType = await this.ticketTypesRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!ticketType) {
      throw new NotFoundException(`TicketType with id "${id}" not found`);
    }

    if (!ticketType.deletedAt) {
      throw new BadRequestException('TicketType is not deleted');
    }

    await this.ticketTypesRepo.restore(id);
    return this.findById(id);
  }

  async findAllWithDeleted(): Promise<TicketType[]> {
    return this.ticketTypesRepo.find({
      withDeleted: true,
      order: { createdAt: 'ASC' },
    });
  }
}

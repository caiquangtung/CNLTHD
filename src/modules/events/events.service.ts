import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import {
  mapCreateEventDtoToEntity,
  applyUpdateEventDtoToEntity,
} from './mappers/event.mapper';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepo: Repository<Event>,
  ) {}

  async create(dto: CreateEventDto): Promise<Event> {
    const existing = await this.eventsRepo.findOne({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('Event with this slug already exists');
    }
    const event = mapCreateEventDtoToEntity(dto);
    return this.eventsRepo.save(event);
  }

  async findAll(): Promise<Event[]> {
    return this.eventsRepo.find({ order: { startTime: 'ASC' } });
  }

  async findById(id: string): Promise<Event> {
    const event = await this.eventsRepo.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event with id "${id}" not found`);
    }
    return event;
  }

  async findBySlug(slug: string): Promise<Event> {
    const event = await this.eventsRepo.findOne({ where: { slug } });
    if (!event) {
      throw new NotFoundException(`Event with slug "${slug}" not found`);
    }
    return event;
  }

  async update(id: string, dto: UpdateEventDto): Promise<Event> {
    const event = await this.findById(id);

    const newSlug = dto.slug ?? event.slug;
    const slugChanged = dto.slug !== undefined && dto.slug !== event.slug;

    if (slugChanged) {
      const conflict = await this.eventsRepo.findOne({
        where: { slug: newSlug },
      });
      if (conflict && conflict.id !== id) {
        throw new ConflictException(
          `Event with slug "${newSlug}" already exists`,
        );
      }
    }

    applyUpdateEventDtoToEntity(event, dto);
    return this.eventsRepo.save(event);
  }

  async softRemove(id: string): Promise<void> {
    const event = await this.findById(id);
    await this.eventsRepo.softRemove(event);
  }

  async restore(id: string): Promise<Event> {
    const event = await this.eventsRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!event) {
      throw new NotFoundException(`Event with id "${id}" not found`);
    }

    if (!event.deletedAt) {
      throw new BadRequestException('Event is not deleted');
    }

    await this.eventsRepo.restore(id);
    return this.findById(id);
  }

  async findAllWithDeleted(): Promise<Event[]> {
    return this.eventsRepo.find({
      withDeleted: true,
      order: { startTime: 'ASC' },
    });
  }
}

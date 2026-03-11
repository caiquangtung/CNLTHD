"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_entity_1 = require("./entities/event.entity");
const event_mapper_1 = require("./mappers/event.mapper");
let EventsService = class EventsService {
    eventsRepo;
    constructor(eventsRepo) {
        this.eventsRepo = eventsRepo;
    }
    async create(dto) {
        const existing = await this.eventsRepo.findOne({
            where: { slug: dto.slug },
        });
        if (existing) {
            throw new common_1.ConflictException('Event with this slug already exists');
        }
        const event = (0, event_mapper_1.mapCreateEventDtoToEntity)(dto);
        return this.eventsRepo.save(event);
    }
    async findAll() {
        return this.eventsRepo.find({ order: { startTime: 'ASC' } });
    }
    async findById(id) {
        const event = await this.eventsRepo.findOne({ where: { id } });
        if (!event) {
            throw new common_1.NotFoundException(`Event with id "${id}" not found`);
        }
        return event;
    }
    async findBySlug(slug) {
        const event = await this.eventsRepo.findOne({ where: { slug } });
        if (!event) {
            throw new common_1.NotFoundException(`Event with slug "${slug}" not found`);
        }
        return event;
    }
    async update(id, dto) {
        const event = await this.findById(id);
        const newSlug = dto.slug ?? event.slug;
        const slugChanged = dto.slug !== undefined && dto.slug !== event.slug;
        if (slugChanged) {
            const conflict = await this.eventsRepo.findOne({
                where: { slug: newSlug },
            });
            if (conflict && conflict.id !== id) {
                throw new common_1.ConflictException(`Event with slug "${newSlug}" already exists`);
            }
        }
        (0, event_mapper_1.applyUpdateEventDtoToEntity)(event, dto);
        return this.eventsRepo.save(event);
    }
    async softRemove(id) {
        const event = await this.findById(id);
        await this.eventsRepo.softRemove(event);
    }
    async restore(id) {
        const event = await this.eventsRepo.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!event) {
            throw new common_1.NotFoundException(`Event with id "${id}" not found`);
        }
        if (!event.deletedAt) {
            throw new common_1.BadRequestException('Event is not deleted');
        }
        await this.eventsRepo.restore(id);
        return this.findById(id);
    }
    async findAllWithDeleted() {
        return this.eventsRepo.find({
            withDeleted: true,
            order: { startTime: 'ASC' },
        });
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EventsService);
//# sourceMappingURL=events.service.js.map
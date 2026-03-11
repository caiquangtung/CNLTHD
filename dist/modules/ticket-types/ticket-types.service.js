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
exports.TicketTypesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ticket_type_entity_1 = require("./entities/ticket-type.entity");
const ticket_type_mapper_1 = require("./mappers/ticket-type.mapper");
let TicketTypesService = class TicketTypesService {
    ticketTypesRepo;
    constructor(ticketTypesRepo) {
        this.ticketTypesRepo = ticketTypesRepo;
    }
    async create(dto) {
        const existing = await this.ticketTypesRepo.findOne({
            where: { eventId: dto.eventId, name: dto.name },
        });
        if (existing) {
            throw new common_1.ConflictException(`Ticket type "${dto.name}" already exists for this event`);
        }
        const ticketType = (0, ticket_type_mapper_1.mapCreateTicketTypeDtoToEntity)(dto);
        return this.ticketTypesRepo.save(ticketType);
    }
    async findAll() {
        return this.ticketTypesRepo.find({ order: { createdAt: 'ASC' } });
    }
    async findByEvent(eventId) {
        return this.ticketTypesRepo.find({
            where: { eventId },
            order: { price: 'ASC' },
        });
    }
    async findById(id) {
        const ticketType = await this.ticketTypesRepo.findOne({ where: { id } });
        if (!ticketType) {
            throw new common_1.NotFoundException(`TicketType with id "${id}" not found`);
        }
        return ticketType;
    }
    async update(id, dto) {
        const ticketType = await this.findById(id);
        const newName = dto.name ?? ticketType.name;
        const newEventId = dto.eventId ?? ticketType.eventId;
        const nameChanged = dto.name !== undefined && dto.name !== ticketType.name;
        const eventChanged = dto.eventId !== undefined && dto.eventId !== ticketType.eventId;
        if (nameChanged || eventChanged) {
            const conflict = await this.ticketTypesRepo.findOne({
                where: { eventId: newEventId, name: newName },
            });
            if (conflict && conflict.id !== id) {
                throw new common_1.ConflictException(`Ticket type "${newName}" already exists for this event`);
            }
        }
        (0, ticket_type_mapper_1.applyUpdateTicketTypeDtoToEntity)(ticketType, dto);
        return this.ticketTypesRepo.save(ticketType);
    }
    async softRemove(id) {
        const ticketType = await this.findById(id);
        await this.ticketTypesRepo.softRemove(ticketType);
    }
    async restore(id) {
        const ticketType = await this.ticketTypesRepo.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!ticketType) {
            throw new common_1.NotFoundException(`TicketType with id "${id}" not found`);
        }
        if (!ticketType.deletedAt) {
            throw new common_1.BadRequestException('TicketType is not deleted');
        }
        await this.ticketTypesRepo.restore(id);
        return this.findById(id);
    }
    async findAllWithDeleted() {
        return this.ticketTypesRepo.find({
            withDeleted: true,
            order: { createdAt: 'ASC' },
        });
    }
};
exports.TicketTypesService = TicketTypesService;
exports.TicketTypesService = TicketTypesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ticket_type_entity_1.TicketType)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TicketTypesService);
//# sourceMappingURL=ticket-types.service.js.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const QRCode = __importStar(require("qrcode"));
const ticket_entity_1 = require("./entities/ticket.entity");
const ticket_mapper_1 = require("./mappers/ticket.mapper");
let TicketsService = class TicketsService {
    ticketsRepo;
    constructor(ticketsRepo) {
        this.ticketsRepo = ticketsRepo;
    }
    async create(dto) {
        const existing = await this.ticketsRepo.findOne({
            where: { ticketCode: dto.ticketCode },
        });
        if (existing) {
            throw new common_1.ConflictException(`Ticket code "${dto.ticketCode}" already exists`);
        }
        const ticket = (0, ticket_mapper_1.mapCreateTicketDtoToEntity)(dto);
        return this.ticketsRepo.save(ticket);
    }
    async findAll() {
        return this.ticketsRepo.find({ order: { createdAt: 'ASC' } });
    }
    async findAllWithDeleted() {
        return this.ticketsRepo.find({
            withDeleted: true,
            order: { createdAt: 'ASC' },
        });
    }
    async findByOrder(orderId) {
        return this.ticketsRepo.find({
            where: { orderId },
            order: { createdAt: 'ASC' },
        });
    }
    async findByUser(userId) {
        return this.ticketsRepo
            .createQueryBuilder('ticket')
            .innerJoinAndSelect('ticket.order', 'order')
            .where('order.user_id = :userId', { userId })
            .orderBy('ticket.created_at', 'ASC')
            .getMany();
    }
    async findById(id) {
        const ticket = await this.ticketsRepo.findOne({ where: { id } });
        if (!ticket) {
            throw new common_1.NotFoundException(`Ticket with id "${id}" not found`);
        }
        return ticket;
    }
    async findByCode(ticketCode) {
        const ticket = await this.ticketsRepo.findOne({ where: { ticketCode } });
        if (!ticket) {
            throw new common_1.NotFoundException(`Ticket with code "${ticketCode}" not found`);
        }
        return ticket;
    }
    async generateQrBase64(id) {
        const ticket = await this.findById(id);
        return QRCode.toDataURL(ticket.qrData, { margin: 2, width: 256 });
    }
    async update(id, dto) {
        const ticket = await this.findById(id);
        if (dto.ticketCode && dto.ticketCode !== ticket.ticketCode) {
            const conflict = await this.ticketsRepo.findOne({
                where: { ticketCode: dto.ticketCode },
            });
            if (conflict && conflict.id !== id) {
                throw new common_1.ConflictException(`Ticket code "${dto.ticketCode}" already exists`);
            }
        }
        (0, ticket_mapper_1.applyUpdateTicketDtoToEntity)(ticket, dto);
        return this.ticketsRepo.save(ticket);
    }
    async softRemove(id) {
        const ticket = await this.findById(id);
        await this.ticketsRepo.softRemove(ticket);
    }
    async markAsUsed(id) {
        const ticket = await this.findById(id);
        if (ticket.status === ticket_entity_1.TicketStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cancelled ticket cannot be used');
        }
        if (ticket.status === ticket_entity_1.TicketStatus.USED) {
            throw new common_1.BadRequestException('Ticket is already used');
        }
        ticket.status = ticket_entity_1.TicketStatus.USED;
        return this.ticketsRepo.save(ticket);
    }
    async markAsCancelled(id) {
        const ticket = await this.findById(id);
        if (ticket.status === ticket_entity_1.TicketStatus.USED) {
            throw new common_1.BadRequestException('Used ticket cannot be cancelled');
        }
        if (ticket.status === ticket_entity_1.TicketStatus.CANCELLED) {
            throw new common_1.BadRequestException('Ticket is already cancelled');
        }
        ticket.status = ticket_entity_1.TicketStatus.CANCELLED;
        return this.ticketsRepo.save(ticket);
    }
    async restore(id) {
        const ticket = await this.ticketsRepo.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!ticket) {
            throw new common_1.NotFoundException(`Ticket with id "${id}" not found`);
        }
        if (!ticket.deletedAt) {
            throw new common_1.BadRequestException('Ticket is not deleted');
        }
        await this.ticketsRepo.restore(id);
        return this.findById(id);
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ticket_entity_1.Ticket)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map
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
exports.TicketsController = void 0;
const common_1 = require("@nestjs/common");
const tickets_service_1 = require("./tickets.service");
const create_ticket_dto_1 = require("./dto/create-ticket.dto");
const update_ticket_dto_1 = require("./dto/update-ticket.dto");
const ticket_mapper_1 = require("./mappers/ticket.mapper");
const decorators_1 = require("../../common/decorators");
const guards_1 = require("../../common/guards");
const user_entity_1 = require("../users/entities/user.entity");
let TicketsController = class TicketsController {
    ticketsService;
    constructor(ticketsService) {
        this.ticketsService = ticketsService;
    }
    async create(createTicketDto) {
        const ticket = await this.ticketsService.create(createTicketDto);
        return (0, ticket_mapper_1.mapTicketToResponseDto)(ticket);
    }
    async findAll() {
        const tickets = await this.ticketsService.findAll();
        return (0, ticket_mapper_1.mapTicketsToResponseDto)(tickets);
    }
    async findAllWithDeleted() {
        const tickets = await this.ticketsService.findAllWithDeleted();
        return (0, ticket_mapper_1.mapTicketsToResponseDto)(tickets);
    }
    async findMyTickets(user) {
        const tickets = await this.ticketsService.findByUser(user.id);
        return (0, ticket_mapper_1.mapTicketsToResponseDto)(tickets);
    }
    async findByOrder(orderId) {
        const tickets = await this.ticketsService.findByOrder(orderId);
        return (0, ticket_mapper_1.mapTicketsToResponseDto)(tickets);
    }
    async findByCode(ticketCode) {
        const ticket = await this.ticketsService.findByCode(ticketCode);
        return (0, ticket_mapper_1.mapTicketToResponseDto)(ticket);
    }
    async getTicketQR(id) {
        return this.ticketsService.generateQrBase64(id);
    }
    async findOne(id) {
        const ticket = await this.ticketsService.findById(id);
        return (0, ticket_mapper_1.mapTicketToResponseDto)(ticket);
    }
    async update(id, updateTicketDto) {
        const ticket = await this.ticketsService.update(id, updateTicketDto);
        return (0, ticket_mapper_1.mapTicketToResponseDto)(ticket);
    }
    async markAsUsed(id) {
        const ticket = await this.ticketsService.markAsUsed(id);
        return (0, ticket_mapper_1.mapTicketToResponseDto)(ticket);
    }
    async markAsCancelled(id) {
        const ticket = await this.ticketsService.markAsCancelled(id);
        return (0, ticket_mapper_1.mapTicketToResponseDto)(ticket);
    }
    async restore(id) {
        const ticket = await this.ticketsService.restore(id);
        return (0, ticket_mapper_1.mapTicketToResponseDto)(ticket);
    }
    async remove(id) {
        await this.ticketsService.softRemove(id);
    }
};
exports.TicketsController = TicketsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.ORGANIZER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ticket_dto_1.CreateTicketDto]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.ORGANIZER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('deleted'),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findAllWithDeleted", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findMyTickets", null);
__decorate([
    (0, common_1.Get)('order/:orderId'),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.ORGANIZER),
    __param(0, (0, common_1.Param)('orderId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findByOrder", null);
__decorate([
    (0, common_1.Get)('code/:ticketCode'),
    __param(0, (0, common_1.Param)('ticketCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findByCode", null);
__decorate([
    (0, common_1.Get)(':id/qr'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getTicketQR", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.ORGANIZER),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_ticket_dto_1.UpdateTicketDto]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/use'),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.ORGANIZER),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "markAsUsed", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.ORGANIZER),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "markAsCancelled", null);
__decorate([
    (0, common_1.Patch)(':id/restore'),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.ORGANIZER),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "remove", null);
exports.TicketsController = TicketsController = __decorate([
    (0, common_1.Controller)('tickets'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    __metadata("design:paramtypes", [tickets_service_1.TicketsService])
], TicketsController);
//# sourceMappingURL=tickets.controller.js.map
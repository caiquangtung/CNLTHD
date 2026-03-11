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
exports.TicketTypesController = void 0;
const common_1 = require("@nestjs/common");
const ticket_types_service_1 = require("./ticket-types.service");
const create_ticket_type_dto_1 = require("./dto/create-ticket-type.dto");
const update_ticket_type_dto_1 = require("./dto/update-ticket-type.dto");
const ticket_type_mapper_1 = require("./mappers/ticket-type.mapper");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const user_entity_1 = require("../users/entities/user.entity");
let TicketTypesController = class TicketTypesController {
    ticketTypesService;
    constructor(ticketTypesService) {
        this.ticketTypesService = ticketTypesService;
    }
    async create(createTicketTypeDto) {
        const ticketType = await this.ticketTypesService.create(createTicketTypeDto);
        return (0, ticket_type_mapper_1.mapTicketTypeToResponseDto)(ticketType);
    }
    async findAll() {
        const ticketTypes = await this.ticketTypesService.findAll();
        return (0, ticket_type_mapper_1.mapTicketTypesToResponseDto)(ticketTypes);
    }
    async findAllWithDeleted() {
        const ticketTypes = await this.ticketTypesService.findAllWithDeleted();
        return (0, ticket_type_mapper_1.mapTicketTypesToResponseDto)(ticketTypes);
    }
    async findByEvent(eventId) {
        const ticketTypes = await this.ticketTypesService.findByEvent(eventId);
        return (0, ticket_type_mapper_1.mapTicketTypesToResponseDto)(ticketTypes);
    }
    async findOne(id) {
        const ticketType = await this.ticketTypesService.findById(id);
        return (0, ticket_type_mapper_1.mapTicketTypeToResponseDto)(ticketType);
    }
    async update(id, updateTicketTypeDto) {
        const ticketType = await this.ticketTypesService.update(id, updateTicketTypeDto);
        return (0, ticket_type_mapper_1.mapTicketTypeToResponseDto)(ticketType);
    }
    async restore(id) {
        const ticketType = await this.ticketTypesService.restore(id);
        return (0, ticket_type_mapper_1.mapTicketTypeToResponseDto)(ticketType);
    }
    async remove(id) {
        await this.ticketTypesService.softRemove(id);
    }
};
exports.TicketTypesController = TicketTypesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ticket_type_dto_1.CreateTicketTypeDto]),
    __metadata("design:returntype", Promise)
], TicketTypesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TicketTypesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('deleted'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TicketTypesController.prototype, "findAllWithDeleted", null);
__decorate([
    (0, common_1.Get)('event/:eventId'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('eventId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketTypesController.prototype, "findByEvent", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketTypesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_ticket_type_dto_1.UpdateTicketTypeDto]),
    __metadata("design:returntype", Promise)
], TicketTypesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/restore'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketTypesController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketTypesController.prototype, "remove", null);
exports.TicketTypesController = TicketTypesController = __decorate([
    (0, common_1.Controller)('ticket-types'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [ticket_types_service_1.TicketTypesService])
], TicketTypesController);
//# sourceMappingURL=ticket-types.controller.js.map
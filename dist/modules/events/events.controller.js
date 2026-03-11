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
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const events_service_1 = require("./events.service");
const create_event_dto_1 = require("./dto/create-event.dto");
const update_event_dto_1 = require("./dto/update-event.dto");
const event_mapper_1 = require("./mappers/event.mapper");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const user_entity_1 = require("../users/entities/user.entity");
const ticket_types_service_1 = require("../ticket-types/ticket-types.service");
const create_ticket_type_dto_1 = require("../ticket-types/dto/create-ticket-type.dto");
const ticket_type_mapper_1 = require("../ticket-types/mappers/ticket-type.mapper");
let EventsController = class EventsController {
    eventsService;
    ticketTypesService;
    constructor(eventsService, ticketTypesService) {
        this.eventsService = eventsService;
        this.ticketTypesService = ticketTypesService;
    }
    async create(createEventDto) {
        const event = await this.eventsService.create(createEventDto);
        return (0, event_mapper_1.mapEventToResponseDto)(event);
    }
    async findAll() {
        const events = await this.eventsService.findAll();
        return (0, event_mapper_1.mapEventsToResponseDto)(events);
    }
    async findAllWithDeleted() {
        const events = await this.eventsService.findAllWithDeleted();
        return (0, event_mapper_1.mapEventsToResponseDto)(events);
    }
    async findOne(id) {
        const event = await this.eventsService.findById(id);
        return (0, event_mapper_1.mapEventToResponseDto)(event);
    }
    async findTicketsByEvent(id) {
        await this.eventsService.findById(id);
        const ticketTypes = await this.ticketTypesService.findByEvent(id);
        return (0, ticket_type_mapper_1.mapTicketTypesToResponseDto)(ticketTypes);
    }
    async createTicketTypeForEvent(id, createTicketTypeDto) {
        await this.eventsService.findById(id);
        const ticketType = await this.ticketTypesService.create({
            ...createTicketTypeDto,
            eventId: id,
        });
        return (0, ticket_type_mapper_1.mapTicketTypeToResponseDto)(ticketType);
    }
    async update(id, updateEventDto) {
        const event = await this.eventsService.update(id, updateEventDto);
        return (0, event_mapper_1.mapEventToResponseDto)(event);
    }
    async restore(id) {
        const event = await this.eventsService.restore(id);
        return (0, event_mapper_1.mapEventToResponseDto)(event);
    }
    async remove(id) {
        await this.eventsService.softRemove(id);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_dto_1.CreateEventDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('deleted'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findAllWithDeleted", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/tickets'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findTicketsByEvent", null);
__decorate([
    (0, common_1.Post)(':id/tickets'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_ticket_type_dto_1.CreateTicketTypeDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "createTicketTypeForEvent", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_event_dto_1.UpdateEventDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/restore'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "remove", null);
exports.EventsController = EventsController = __decorate([
    (0, common_1.Controller)('events'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [events_service_1.EventsService,
        ticket_types_service_1.TicketTypesService])
], EventsController);
//# sourceMappingURL=events.controller.js.map
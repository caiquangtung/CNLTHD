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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketType = void 0;
const typeorm_1 = require("typeorm");
const entities_1 = require("../../../common/entities");
const event_entity_1 = require("../../events/entities/event.entity");
const order_reservation_entity_1 = require("../../bookings/entities/order-reservation.entity");
const ticket_entity_1 = require("../../tickets/entities/ticket.entity");
const order_item_entity_1 = require("../../orders/entities/order-item.entity");
let TicketType = class TicketType extends entities_1.BaseEntity {
    eventId;
    name;
    description;
    price;
    quantity;
    maxPerOrder;
    event;
    reservations;
    orderItems;
    tickets;
};
exports.TicketType = TicketType;
__decorate([
    (0, typeorm_1.Index)('idx_ticket_types_event_id'),
    (0, typeorm_1.Column)({ name: 'event_id' }),
    __metadata("design:type", String)
], TicketType.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TicketType.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], TicketType.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], TicketType.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], TicketType.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_per_order', type: 'int', default: 10 }),
    __metadata("design:type", Number)
], TicketType.prototype, "maxPerOrder", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => event_entity_1.Event, (event) => event.ticketTypes),
    (0, typeorm_1.JoinColumn)({ name: 'event_id' }),
    __metadata("design:type", event_entity_1.Event)
], TicketType.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_reservation_entity_1.OrderReservation, (reservation) => reservation.ticketType),
    __metadata("design:type", Array)
], TicketType.prototype, "reservations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_item_entity_1.OrderItem, (orderItem) => orderItem.ticketType),
    __metadata("design:type", Array)
], TicketType.prototype, "orderItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ticket_entity_1.Ticket, (ticket) => ticket.ticketType),
    __metadata("design:type", Array)
], TicketType.prototype, "tickets", void 0);
exports.TicketType = TicketType = __decorate([
    (0, typeorm_1.Entity)('ticket_types')
], TicketType);
//# sourceMappingURL=ticket-type.entity.js.map
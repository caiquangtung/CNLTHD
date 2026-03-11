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
exports.Ticket = exports.TicketStatus = void 0;
const typeorm_1 = require("typeorm");
const entities_1 = require("../../../common/entities");
const order_entity_1 = require("../../orders/entities/order.entity");
const ticket_type_entity_1 = require("../../ticket-types/entities/ticket-type.entity");
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["ACTIVE"] = "active";
    TicketStatus["USED"] = "used";
    TicketStatus["CANCELLED"] = "cancelled";
})(TicketStatus || (exports.TicketStatus = TicketStatus = {}));
let Ticket = class Ticket extends entities_1.BaseEntity {
    orderId;
    ticketTypeId;
    ticketCode;
    qrData;
    status;
    order;
    ticketType;
};
exports.Ticket = Ticket;
__decorate([
    (0, typeorm_1.Index)('idx_tickets_order_id'),
    (0, typeorm_1.Column)({ name: 'order_id' }),
    __metadata("design:type", String)
], Ticket.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ticket_type_id' }),
    __metadata("design:type", String)
], Ticket.prototype, "ticketTypeId", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_tickets_code'),
    (0, typeorm_1.Column)({ name: 'ticket_code', unique: true }),
    __metadata("design:type", String)
], Ticket.prototype, "ticketCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'qr_data', type: 'text' }),
    __metadata("design:type", String)
], Ticket.prototype, "qrData", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TicketStatus,
        default: TicketStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Ticket.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => order_entity_1.Order, (order) => order.tickets),
    (0, typeorm_1.JoinColumn)({ name: 'order_id' }),
    __metadata("design:type", order_entity_1.Order)
], Ticket.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ticket_type_entity_1.TicketType, (ticketType) => ticketType.tickets),
    (0, typeorm_1.JoinColumn)({ name: 'ticket_type_id' }),
    __metadata("design:type", ticket_type_entity_1.TicketType)
], Ticket.prototype, "ticketType", void 0);
exports.Ticket = Ticket = __decorate([
    (0, typeorm_1.Entity)('tickets')
], Ticket);
//# sourceMappingURL=ticket.entity.js.map
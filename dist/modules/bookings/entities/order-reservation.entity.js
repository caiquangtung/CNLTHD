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
exports.OrderReservation = exports.ReservationStatus = void 0;
const typeorm_1 = require("typeorm");
const entities_1 = require("../../../common/entities");
const user_entity_1 = require("../../users/entities/user.entity");
const ticket_type_entity_1 = require("../../ticket-types/entities/ticket-type.entity");
var ReservationStatus;
(function (ReservationStatus) {
    ReservationStatus["ACTIVE"] = "active";
    ReservationStatus["COMPLETED"] = "completed";
    ReservationStatus["EXPIRED"] = "expired";
    ReservationStatus["CANCELLED"] = "cancelled";
})(ReservationStatus || (exports.ReservationStatus = ReservationStatus = {}));
let OrderReservation = class OrderReservation extends entities_1.BaseEntity {
    userId;
    ticketTypeId;
    quantity;
    unitPrice;
    expiresAt;
    status;
    user;
    ticketType;
};
exports.OrderReservation = OrderReservation;
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], OrderReservation.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ticket_type_id' }),
    __metadata("design:type", String)
], OrderReservation.prototype, "ticketTypeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], OrderReservation.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], OrderReservation.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], OrderReservation.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ReservationStatus,
        default: ReservationStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], OrderReservation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], OrderReservation.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ticket_type_entity_1.TicketType, (ticketType) => ticketType.reservations),
    (0, typeorm_1.JoinColumn)({ name: 'ticket_type_id' }),
    __metadata("design:type", ticket_type_entity_1.TicketType)
], OrderReservation.prototype, "ticketType", void 0);
exports.OrderReservation = OrderReservation = __decorate([
    (0, typeorm_1.Entity)('order_reservations'),
    (0, typeorm_1.Index)('idx_reservations_user_ticket', ['userId', 'ticketTypeId']),
    (0, typeorm_1.Index)('idx_reservations_status_expires', ['status', 'expiresAt'])
], OrderReservation);
//# sourceMappingURL=order-reservation.entity.js.map
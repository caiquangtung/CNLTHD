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
exports.Event = exports.EventStatus = void 0;
const typeorm_1 = require("typeorm");
const entities_1 = require("../../../common/entities");
const ticket_type_entity_1 = require("../../ticket-types/entities/ticket-type.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var EventStatus;
(function (EventStatus) {
    EventStatus["DRAFT"] = "draft";
    EventStatus["PUBLISHED"] = "published";
    EventStatus["CANCELLED"] = "cancelled";
})(EventStatus || (exports.EventStatus = EventStatus = {}));
let Event = class Event extends entities_1.BaseEntity {
    slug;
    name;
    description;
    location;
    startTime;
    endTime;
    status;
    organizerId;
    organizer;
    ticketTypes;
};
exports.Event = Event;
__decorate([
    (0, typeorm_1.Index)('idx_events_slug'),
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Event.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Event.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Event.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Event.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_events_start_time'),
    (0, typeorm_1.Column)({ name: 'start_time', type: 'timestamp' }),
    __metadata("design:type", Date)
], Event.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_time', type: 'timestamp' }),
    __metadata("design:type", Date)
], Event.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_events_status'),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EventStatus,
        default: EventStatus.DRAFT,
    }),
    __metadata("design:type", String)
], Event.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Index)('idx_events_organizer_id'),
    (0, typeorm_1.Column)({ name: 'organizer_id', nullable: true }),
    __metadata("design:type", String)
], Event.prototype, "organizerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'organizer_id' }),
    __metadata("design:type", user_entity_1.User)
], Event.prototype, "organizer", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ticket_type_entity_1.TicketType, (ticketType) => ticketType.event),
    __metadata("design:type", Array)
], Event.prototype, "ticketTypes", void 0);
exports.Event = Event = __decorate([
    (0, typeorm_1.Entity)('events')
], Event);
//# sourceMappingURL=event.entity.js.map
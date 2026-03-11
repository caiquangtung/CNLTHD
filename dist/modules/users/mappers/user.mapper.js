"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapCreateUserDtoToEntity = mapCreateUserDtoToEntity;
exports.applyUpdateUserDtoToEntity = applyUpdateUserDtoToEntity;
exports.mapUserToResponseDto = mapUserToResponseDto;
exports.mapUsersToResponseDto = mapUsersToResponseDto;
const class_transformer_1 = require("class-transformer");
const user_entity_1 = require("../entities/user.entity");
const user_response_dto_1 = require("../dto/user-response.dto");
function mapCreateUserDtoToEntity(dto) {
    const user = new user_entity_1.User();
    user.email = dto.email;
    user.fullName = dto.fullName;
    user.profileData = {};
    return user;
}
function applyUpdateUserDtoToEntity(user, dto) {
    if (dto.fullName !== undefined) {
        user.fullName = dto.fullName;
    }
    return user;
}
function mapUserToResponseDto(user) {
    return (0, class_transformer_1.plainToInstance)(user_response_dto_1.UserResponseDto, user, {
        excludeExtraneousValues: true,
    });
}
function mapUsersToResponseDto(users) {
    return (0, class_transformer_1.plainToInstance)(user_response_dto_1.UserResponseDto, users, {
        excludeExtraneousValues: true,
    });
}
//# sourceMappingURL=user.mapper.js.map
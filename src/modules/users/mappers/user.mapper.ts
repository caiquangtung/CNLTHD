import { plainToInstance } from 'class-transformer';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';

export function mapCreateUserDtoToEntity(dto: CreateUserDto): User {
  const user = new User();
  user.email = dto.email;
  user.fullName = dto.fullName;
  user.profileData = {};
  return user;
}

export function applyUpdateUserDtoToEntity(
  user: User,
  dto: UpdateUserDto,
): User {
  if (dto.fullName !== undefined) {
    user.fullName = dto.fullName;
  }

  return user;
}

export function mapUserToResponseDto(user: User): UserResponseDto {
  return plainToInstance(UserResponseDto, user, {
    excludeExtraneousValues: true,
  });
}

export function mapUsersToResponseDto(users: User[]): UserResponseDto[] {
  return plainToInstance(UserResponseDto, users, {
    excludeExtraneousValues: true,
  });
}


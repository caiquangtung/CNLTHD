import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
export declare function mapCreateUserDtoToEntity(dto: CreateUserDto): User;
export declare function applyUpdateUserDtoToEntity(user: User, dto: UpdateUserDto): User;
export declare function mapUserToResponseDto(user: User): UserResponseDto;
export declare function mapUsersToResponseDto(users: User[]): UserResponseDto[];

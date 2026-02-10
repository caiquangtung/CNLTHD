import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import {
  mapUserToResponseDto,
  mapUsersToResponseDto,
} from './mappers/user.mapper';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * NOTE: User creation is disabled here
   * Users should be created through /auth/register endpoint only
   * This ensures proper password hashing and validation
   */
  // @Post()
  // @HttpCode(HttpStatus.CREATED)
  // async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
  //   const user = await this.usersService.createWithHashedPassword(createUserDto);
  //   return mapUserToResponseDto(user);
  // }

  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAllWithDeleted();
    return mapUsersToResponseDto(users);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findById(id);
    return mapUserToResponseDto(user);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.update(id, updateUserDto);
    return mapUserToResponseDto(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.usersService.softRemove(id);
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import {
  applyUpdateUserDtoToEntity,
  mapCreateUserDtoToEntity,
} from './mappers/user.mapper';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  /**
   * Create user with hashed password
   * Should be called from AuthService only
   */
  async createWithHashedPassword(dto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const user = mapCreateUserDtoToEntity(dto);
    
    // Hash password
    const saltRounds = 10;
    user.passwordHash = await bcrypt.hash(dto.password, saltRounds);
    
    return this.usersRepo.save(user);
  }

  /**
   * Internal method - DO NOT expose via controller
   * @deprecated Use createWithHashedPassword instead
   */
  async create(dto: CreateUserDto): Promise<User> {
    const user = mapCreateUserDtoToEntity(dto);
    return this.usersRepo.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    applyUpdateUserDtoToEntity(user, dto);
    return this.usersRepo.save(user);
  }

  /**
   * Soft delete a user (sets deletedAt timestamp)
   * User can be restored later
   */
  async softRemove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.usersRepo.softRemove(user);
  }

  /**
   * Restore a soft-deleted user
   */
  async restore(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { id },
      withDeleted: true, // Include soft-deleted records
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.deletedAt) {
      throw new NotFoundException('User is not deleted');
    }

    await this.usersRepo.restore(id);
    return this.findById(id);
  }

  /**
   * Find all users including soft-deleted ones
   * Admin only
   */
  async findAllWithDeleted(): Promise<User[]> {
    return this.usersRepo.find({ withDeleted: true });
  }

  /**
   * Permanently delete a user (hard delete)
   * Cannot be restored - Admin only
   */
  async hardRemove(id: string): Promise<void> {
    const user = await this.usersRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepo.remove(user);
  }

  /**
   * Legacy method - now uses soft delete
   * @deprecated Use softRemove instead
   */
  async remove(id: string): Promise<void> {
    await this.softRemove(id);
  }
}

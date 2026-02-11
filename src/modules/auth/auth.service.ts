import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { mapUserToResponseDto } from '../users/mappers/user.mapper';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) {}

    async register(dto: RegisterDto): Promise<AuthResponseDto> {
        const user = await this.usersService.createWithHashedPassword(dto);
        const accessToken = this.generateToken(user);
        return {
            accessToken,
            user: mapUserToResponseDto(user),
        };
    }
    async login(dto: LoginDto): Promise<AuthResponseDto> {
        const user = await this.validateUser(dto.email, dto.password);
        
        const accessToken = this.generateToken(user);
        return {
            accessToken,
            user: mapUserToResponseDto(user),
        };
    }
    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await this.validateUserPassword(user, password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return user;
    }
    async validateUserPassword(user: User, password: string): Promise<boolean> {
        return await bcrypt.compare(password, user.passwordHash);
    }
    private generateToken(user: User): string {
        const payload = {
          sub: user.id,
          email: user.email,
          role: user.role,
        };
    
        return this.jwtService.sign(payload);
      }
}

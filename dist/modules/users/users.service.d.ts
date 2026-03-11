import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
export declare class UsersService {
    private usersRepo;
    constructor(usersRepo: Repository<User>);
    createWithHashedPassword(dto: CreateUserDto): Promise<User>;
    create(dto: CreateUserDto): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User>;
    update(id: string, dto: UpdateUserDto): Promise<User>;
    softRemove(id: string): Promise<void>;
    restore(id: string): Promise<User>;
    findAllWithDeleted(): Promise<User[]>;
    hardRemove(id: string): Promise<void>;
    remove(id: string): Promise<void>;
}

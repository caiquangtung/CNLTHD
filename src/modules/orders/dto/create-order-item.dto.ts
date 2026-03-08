import { IsString, IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDto {
    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'Ticket Type ID',
    })
    @IsString()
    ticketTypeId: string;

    @ApiProperty({
        example: 2,
        description: 'Quantity of tickets',
        minimum: 1,
    })
    @IsNumber()
    @IsPositive()
    @Min(1, { message: 'Số lượng phải là số dương và có ít nhất 1 vé' })
    quantity: number;
}


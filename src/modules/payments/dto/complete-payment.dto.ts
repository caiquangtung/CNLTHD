import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CompletePaymentDto {
    @ApiProperty({
        description: 'Transaction ID from payment gateway',
        example: 'TXN123456789',
    })
    @IsString()
    @IsNotEmpty({ message: 'Transaction ID is required' })
    transactionId: string;
}

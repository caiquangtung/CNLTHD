import { IsString, IsNotEmpty } from 'class-validator';

export class CompletePaymentDto {
    @IsString()
    @IsNotEmpty({ message: 'Transaction ID is required' })
    transactionId: string;
}

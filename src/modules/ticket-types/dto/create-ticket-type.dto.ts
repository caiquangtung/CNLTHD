import {
  IsString,
  IsUUID,
  IsNumber,
  IsInt,
  IsOptional,
  Min,
  MaxLength,
  MinLength,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTicketTypeDto {
  @IsUUID()
  eventId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  price: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxPerOrder?: number;
}

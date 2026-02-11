import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'password must contain at least 1 letter and 1 number',
  })
  password: string;

  @IsString()
  @MinLength(2)
  fullName: string;
}

import { IsEmail, MinLength, IsString } from 'class-validator';

export class RegDto {
  name: string;
  lastName: string;
  @IsEmail()
  email: string;
  @MinLength(6, { message: 'Password must be at least 6 charachers long' })
  @IsString()
  password: string;
}

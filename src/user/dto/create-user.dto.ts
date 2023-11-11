import { IsPhoneNumber, IsString, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsPhoneNumber('BY')
  phoneNumber: string;

  @IsString()
  login: string;

  @IsString()
  @IsStrongPassword({ minLength: 8, minUppercase: 1, minNumbers: 1 })
  password: string;
}

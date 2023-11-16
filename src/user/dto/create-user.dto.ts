import { IsPhoneNumber, IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'Alice',
    description: 'user first name',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Smith',
    description: 'user last name',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    example: '+375295551234',
    description: 'user phone number',
  })
  @IsPhoneNumber('BY')
  phoneNumber: string;

  @ApiProperty({
    example: 'AliceSmith',
    description: 'user login. Should be unique',
  })
  @IsString()
  login: string;

  @ApiProperty({
    example: 'strongPassword123!',
    description:
      'user password, filled by user.' +
      'Should contain minimum 1 capital letter, 1 number and 1 special symbol',
  })
  @IsString()
  @IsStrongPassword({ minLength: 8, minUppercase: 1, minNumbers: 1 })
  password: string;
}

import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({
    example: 'yourLogin',
    description: 'user login.',
  })
  @IsString()
  login: string;

  @ApiProperty({
    example: 'yourStrongPassword123!',
    description: 'user password.',
  })
  @IsString()
  password: string;
}

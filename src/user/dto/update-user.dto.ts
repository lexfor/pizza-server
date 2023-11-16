import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['login', 'password']),
) {
  @ApiProperty({
    example: 'Alice',
    description: 'user first name',
  })
  firstName?: string;

  @ApiProperty({
    example: 'Smith',
    description: 'user last name',
  })
  lastName?: string;

  @ApiProperty({
    example: '+375295551234',
    description: 'user phone number',
  })
  phoneNumber?: string;
}

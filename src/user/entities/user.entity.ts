import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import * as uuid from 'uuid';

@Entity()
export class User {
  @ApiProperty({
    example: '0626b148-d7ff-417f-a056-dfa35507edc4',
    type: uuid.UUID,
    description: 'user auto generated id',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Alice',
    type: 'string',
    description: 'user first name, filled by user',
  })
  @Column('varchar', { name: 'first_name' })
  firstName: string;

  @ApiProperty({
    example: 'Smith',
    type: 'string',
    description: 'user last name, filled by user',
  })
  @Column('varchar', { name: 'last_name' })
  lastName: string;

  @ApiProperty({
    example: '+375295551234',
    type: 'string',
    description: 'user phone number, filled by user',
  })
  @Column('varchar', { name: 'phone_number' })
  phoneNumber: string;

  @ApiProperty({
    example: 'AliceSmith',
    type: 'string',
    description: 'user login, filled by user. Should be unique',
  })
  @Column('varchar', { unique: true })
  login: string;

  @ApiProperty({
    example: 'strongPassword123!',
    type: 'string',
    description:
      'user password, filled by user. ' +
      'Should contain minimum 1 capital letter, 1 number and 1 special symbol',
  })
  @Column('varchar')
  password: string;
}

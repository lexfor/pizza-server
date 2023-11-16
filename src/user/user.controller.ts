import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UUID } from 'uuid';

@Controller('user')
@UsePipes(new ValidationPipe())
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    if (users.length === 0) {
      throw new HttpException('There are no users', HttpStatus.NOT_FOUND);
    }
    return users;
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: UUID) {
    await this.throwNotFoundExceptionIfUserNotExist(id);
    return this.userService.findByID(id);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.throwNotFoundExceptionIfUserNotExist(id);
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: UUID) {
    await this.throwNotFoundExceptionIfUserNotExist(id);
    return this.userService.remove(id);
  }

  async isUserNotExist(userID: UUID) {
    const user: User = await this.userService.findByID(userID);
    return !user;
  }

  async throwNotFoundExceptionIfUserNotExist(userID: UUID) {
    if (await this.isUserNotExist(userID)) {
      throw new HttpException(
        'User with that id is not exist',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}

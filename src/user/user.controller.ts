import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserID } from '../utilities/decorators/user-id.param.decorator';
import { UserIDApiParam } from '../utilities/decorators/user-id.api-param.decoratos';
import { UserNotFoundResponseParam } from '../utilities/decorators/not-found-user.response-param.decoratos';

@Controller('user')
@ApiTags('user')
@UsePipes(new ValidationPipe())
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create user by DTO' })
  @ApiCreatedResponse({ description: 'created user data', type: User })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    description: 'Get all users data',
    type: User,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'None users founded' })
  async findAll() {
    const users = await this.userService.findAll();
    if (users.length === 0) {
      throw new HttpException('None users founded', HttpStatus.NOT_FOUND);
    }
    return users;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @UserIDApiParam()
  @ApiOkResponse({
    description: 'Get user by id',
    type: User,
  })
  @UserNotFoundResponseParam()
  async findOne(@UserID(new ParseUUIDPipe()) id: UUID) {
    return this.userService.findByID(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by id and DTO' })
  @UserIDApiParam()
  @ApiOkResponse({
    description: 'Number of updated users',
  })
  @UserNotFoundResponseParam()
  async update(
    @UserID(new ParseUUIDPipe()) id: UUID,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by id' })
  @UserIDApiParam()
  @ApiOkResponse({
    description: 'Number of deleted users',
  })
  @UserNotFoundResponseParam()
  async remove(@UserID(new ParseUUIDPipe()) id: UUID) {
    return this.userService.remove(id);
  }
}

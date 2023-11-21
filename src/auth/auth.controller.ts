import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { SignInDto } from './dto/sign-in.dto';

@Controller('auth')
@ApiTags('auth')
@UsePipes(new ValidationPipe())
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('/sign-up')
  @ApiOperation({ summary: 'User sign up' })
  @ApiCreatedResponse({ description: 'created user data', type: User })
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User sign in' })
  @ApiOkResponse({ description: 'access token' })
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.login(signInDto);
  }
}

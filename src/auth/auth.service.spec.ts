import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { IJwtToken } from './interfaces/jwt-token.interface';
import * as uuid from 'uuid';
import * as bcrypt from 'bcrypt';

const userID = uuid.v4();
const signInDto: SignInDto = {
  login: 'AliceSmith',
  password: 'Password123',
};

const createUserDto: CreateUserDto = {
  firstName: 'Alice',
  lastName: 'Smith',
  phoneNumber: '+375295551234',
  ...signInDto,
};
const jwtToken: IJwtToken = {
  access_token: { userID }.toString(),
};
let user = new User();
user = {
  id: userID,
  ...createUserDto,
};
const mockedUserService = {
  findByLogin: jest.fn(() => {
    return user;
  }),
};
const mockedJwtService = {
  sign: jest.fn((payload: object) => {
    return payload.toString();
  }),
};

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockedUserService,
        },
        { provide: JwtService, useValue: mockedJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login (get access token by login and password)', () => {
    it('should successfully call all services methods', async () => {
      const spyOnFind = jest.spyOn(userService, 'findByLogin');
      const spyOnCompare = jest
        .spyOn(bcrypt, 'compareSync')
        .mockReturnValue(true);
      const spyOnSign = jest.spyOn(jwtService, 'sign');

      expect(await authService.login(signInDto)).toStrictEqual(jwtToken);

      expect(spyOnFind).toHaveBeenCalledWith(signInDto.login);
      expect(spyOnCompare).toHaveBeenCalledWith(
        signInDto.password,
        signInDto.password,
      );
      expect(spyOnSign).toHaveBeenCalledWith({ userID });
    });

    it('should throw error if password is wrong', async () => {
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
      await expect(authService.login(signInDto)).rejects.toThrow(
        new HttpException('Password is wrong', HttpStatus.UNAUTHORIZED),
      );
    });
  });
});

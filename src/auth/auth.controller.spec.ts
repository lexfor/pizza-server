import { Test, TestingModule } from '@nestjs/testing';
import * as uuid from 'uuid';
import { User } from '../user/entities/user.entity';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { IJwtToken } from './interfaces/jwt-token.interface';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';

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
const jwtToken: IJwtToken = { access_token: { userID }.toString() };
let user = new User();
user = {
  id: userID,
  ...createUserDto,
};
const mockedUserService = {
  create: jest.fn(() => {
    return user;
  }),
};
const mockedAuthService = {
  login: jest.fn((): IJwtToken => {
    return jwtToken;
  }),
};

describe('AuthController', () => {
  let authController: AuthController;
  let userService: UserService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UserService,
          useValue: mockedUserService,
        },
        {
          provide: AuthService,
          useValue: mockedAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
  });

  describe('signUp (create user)', () => {
    it('should successfully call service method', async () => {
      const spy = jest.spyOn(userService, 'create');
      expect(await authController.signUp(createUserDto)).toBe(user);
      expect(spy).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('signIn (get access token by login and password)', () => {
    it('should successfully call service method', async () => {
      const spy = jest.spyOn(authService, 'login');
      expect(await authController.signIn(signInDto)).toBe(jwtToken);
      expect(spy).toHaveBeenCalledWith(signInDto);
    });
  });
});

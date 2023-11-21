import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { User } from './entities/user.entity';
import * as uuid from 'uuid';

const maxCountOfAffectedRows = 100;
const countOfAffectedRows = Math.floor(Math.random() * maxCountOfAffectedRows);
const createUserDto = {
  firstName: 'Alice',
  lastName: 'Smith',
  phoneNumber: '+375295551234',
  login: 'AliceSmith',
  password: 'Password123',
};
const userID = uuid.v4();
let user = new User();
user = {
  id: userID,
  ...createUserDto,
};
const mockedUserService = {
  create: jest.fn(() => {
    return user;
  }),
  update: jest.fn(() => {
    return countOfAffectedRows;
  }),
  findByID: jest.fn(() => {
    return user;
  }),
  findAll: jest.fn(() => {
    return [user];
  }),
  remove: jest.fn(() => {
    return countOfAffectedRows;
  }),
};

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockedUserService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('create (create user)', () => {
    it('should successfully call service method', async () => {
      const spy = jest.spyOn(userService, 'create');
      expect(await userController.create(createUserDto)).toBe(user);
      expect(spy).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('update (update user by id)', () => {
    const updateUser: UpdateUserDto = {
      firstName: 'Alice',
      lastName: 'Smith',
      phoneNumber: '+375295551234',
    };
    it('should successfully call service method', async () => {
      const spy = jest.spyOn(userService, 'update');
      expect(await userController.update(userID, updateUser)).toBe(
        countOfAffectedRows,
      );
      expect(spy).toHaveBeenCalledWith(userID, updateUser);
    });
  });

  describe('findOne (get user by id)', () => {
    it('should successfully call service method', async () => {
      const spy = jest.spyOn(userService, 'findByID');
      expect(await userController.findOne(userID)).toBe(user);
      expect(spy).toHaveBeenCalledWith(userID);
    });
  });

  describe('findAll (get all users)', () => {
    it('should successfully call service method', async () => {
      const spy = jest.spyOn(userService, 'findAll');
      expect(await userController.findAll()).toStrictEqual([user]);
      expect(spy).toHaveBeenCalled();
    });
    it('should throw Not Found exception because none users founded', async () => {
      const spy = jest
        .spyOn(userService, 'findAll')
        .mockImplementation(async () => {
          return [];
        });
      await expect(userController.findAll()).rejects.toThrow(
        new HttpException('None users founded', HttpStatus.NOT_FOUND),
      );
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('remove (delete user by id)', () => {
    it('should successfully call service method', async () => {
      const spy = jest.spyOn(userService, 'remove');
      expect(await userController.remove(userID)).toBe(countOfAffectedRows);
      expect(spy).toHaveBeenCalledWith(userID);
    });
  });
});

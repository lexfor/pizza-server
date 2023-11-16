import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { User } from './entities/user.entity';
import * as uuid from 'uuid';

const maxCountOfAffectedRows = 100;
const countOfAffectedRows = Math.floor(Math.random() * maxCountOfAffectedRows);
let user = new User();
user = {
  id: uuid.v4(),
  firstName: 'Alice',
  lastName: 'Smith',
  phoneNumber: '+375295551234',
  login: 'AliceSmith',
  password: 'Password123',
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

  function mockIsUserNotExistFunction(isUserNotExistFunctionResult: boolean) {
    jest
      .spyOn(userController, 'isUserNotExist')
      .mockImplementation(async () => {
        return isUserNotExistFunctionResult;
      });
  }

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
    const newUser: CreateUserDto = {
      firstName: 'Alice',
      lastName: 'Smith',
      phoneNumber: '+375295551234',
      login: 'AliceSmith',
      password: 'Password123',
    };
    it('should successfully call service method', async () => {
      const spy = jest.spyOn(userService, 'create');
      expect(await userController.create(newUser)).toBe(user);
      expect(spy).toHaveBeenCalledWith(newUser);
    });
  });

  describe('update (update user by id)', () => {
    const userID = uuid.v4();
    const updateUser: UpdateUserDto = {
      firstName: 'Alice',
      lastName: 'Smith',
      phoneNumber: '+375295551234',
    };
    it('should successfully call service method', async () => {
      mockIsUserNotExistFunction(false);
      const spy = jest.spyOn(userService, 'update');
      expect(await userController.update(userID, updateUser)).toBe(
        countOfAffectedRows,
      );
      expect(spy).toHaveBeenCalledWith(userID, updateUser);
    });
    it('should throw Not Found exception because user not exist', async () => {
      mockIsUserNotExistFunction(true);
      await expect(userController.update(userID, updateUser)).rejects.toThrow(
        new HttpException(
          'User with that id is not exist',
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('findOne (get user by id)', () => {
    const userID = uuid.v4();
    it('should successfully call service method', async () => {
      mockIsUserNotExistFunction(false);
      const spy = jest.spyOn(userService, 'findByID');
      expect(await userController.findOne(userID)).toBe(user);
      expect(spy).toHaveBeenCalledWith(userID);
    });
    it('should throw Not Found exception because user not exist', async () => {
      mockIsUserNotExistFunction(true);
      await expect(userController.findOne(userID)).rejects.toThrow(
        new HttpException(
          'User with that id is not exist',
          HttpStatus.NOT_FOUND,
        ),
      );
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
    const userID = uuid.v4();
    it('should successfully call service method', async () => {
      mockIsUserNotExistFunction(false);
      const spy = jest.spyOn(userService, 'remove');
      expect(await userController.remove(userID)).toBe(countOfAffectedRows);
      expect(spy).toHaveBeenCalledWith(userID);
    });
    it('should throw Not Found exception because user not exist', async () => {
      mockIsUserNotExistFunction(true);
      await expect(userController.remove(userID)).rejects.toThrow(
        new HttpException(
          'User with that id is not exist',
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('throwNotFoundExceptionIfUserNotExist (throw Not Found HttpException if user not exist)', () => {
    const userID = uuid.v4();
    it('should not throw exception if user exist', async () => {
      mockIsUserNotExistFunction(false);
      expect(
        await userController.throwNotFoundExceptionIfUserNotExist(userID),
      ).toBeUndefined();
    });
    it('should throw exception if user not exist', async () => {
      mockIsUserNotExistFunction(true);
      await expect(
        userController.throwNotFoundExceptionIfUserNotExist(userID),
      ).rejects.toThrow(
        new HttpException(
          'User with that id is not exist',
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('isUserNotExist (check is user not exist)', () => {
    const userID = uuid.v4();
    it('should return false if user exist', async () => {
      expect(await userController.isUserNotExist(userID)).toBe(false);
    });
    it('should return true if user not exist', async () => {
      jest.spyOn(userService, 'findByID').mockImplementation(async () => null);
      expect(await userController.isUserNotExist(userID)).toBe(true);
    });
  });
});

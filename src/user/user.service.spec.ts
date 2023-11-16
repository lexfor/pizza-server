import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as uuid from 'uuid';

const maxCountOfAffectedRows = 100;
const countOfAffectedRows: number = Math.floor(
  Math.random() * maxCountOfAffectedRows,
);
const userID: string = uuid.v4();

const mockedUserRepository = {
  create: jest.fn((createUserDto: CreateUserDto) => {
    const newUser: User = new User();
    newUser.id = userID;
    newUser.firstName = createUserDto.firstName;
    newUser.lastName = createUserDto.lastName;
    newUser.phoneNumber = createUserDto.phoneNumber;
    newUser.login = createUserDto.login;
    newUser.password = createUserDto.password;
    return newUser;
  }),
  save: jest.fn((user: User) => {
    return user;
  }),
  update: jest.fn(() => {
    return { affected: countOfAffectedRows };
  }),
  findOne: jest.fn(({ where: { id: id } }) => {
    return id;
  }),
  find: jest.fn(() => {}),
  delete: jest.fn(() => {
    return { affected: countOfAffectedRows };
  }),
};

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'USER_REPOSITORY',
          useValue: mockedUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>('USER_REPOSITORY');
  });

  describe('create (create user)', () => {
    const newUser: CreateUserDto = {
      firstName: 'Alice',
      lastName: 'Smith',
      phoneNumber: '+375295551234',
      login: 'AliceSmith',
      password: 'Password123',
    };
    it('should successfully call repository method', async () => {
      const spyOnCreate = jest.spyOn(userRepository, 'create');
      const spyOnSave = jest.spyOn(userRepository, 'save');
      expect(await userService.create(newUser)).toEqual({
        id: userID,
        ...newUser,
      });
      expect(spyOnCreate).toHaveBeenCalledWith(newUser);
      expect(spyOnSave).toHaveBeenCalledWith({ id: userID, ...newUser });
    });
  });

  describe('update (update user)', () => {
    const updateUser: UpdateUserDto = {
      firstName: 'Alice',
      lastName: 'Smith',
      phoneNumber: '+375295551234',
    };
    it('should successfully call repository method', async () => {
      const spy = jest.spyOn(userRepository, 'update');
      expect(await userService.update(userID, updateUser)).toBe(
        countOfAffectedRows,
      );
      expect(spy).toHaveBeenCalledWith(userID, updateUser);
    });
  });

  describe('findByID (get user by id)', () => {
    it('should successfully call repository method', async () => {
      const spy = jest.spyOn(userRepository, 'findOne');
      expect(await userService.findByID(userID)).toBe(userID);
      expect(spy).toHaveBeenCalledWith({ where: { id: userID } });
    });
  });

  describe('findAll (get all users)', () => {
    it('should successfully call repository method', async () => {
      const spy = jest.spyOn(userRepository, 'find');
      expect(await userService.findAll());
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('remove (delete user by id)', () => {
    it('should successfully call repository method', async () => {
      const spy = jest.spyOn(userRepository, 'delete');
      expect(await userService.remove(userID)).toBe(countOfAffectedRows);
      expect(spy).toHaveBeenCalledWith(userID);
    });
  });
});

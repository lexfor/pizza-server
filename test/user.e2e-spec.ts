import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { UserModule } from '../src/user/user.module';
import { CreateUserDto } from '../src/user/dto/create-user.dto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from '../src/user/entities/user.entity';
import { UpdateUserDto } from '../src/user/dto/update-user.dto';
import { validate } from '../src/utilities/config/env.validation';
import { ConfigModule } from '@nestjs/config';
import * as uuid from 'uuid';
import * as request from 'supertest';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  const createUserDto: CreateUserDto = {
    firstName: 'Alice',
    lastName: 'Smith',
    phoneNumber: '+375295551234',
    login: 'AliceSmith',
    password: 'Password123!',
  };

  async function deleteUsersByID(userIDs: string[]) {
    await Promise.all(
      userIDs.map(async (id) => {
        await deleteUserIfExist({ id });
      }),
    );
  }

  async function deleteUserIfExist(where: FindOptionsWhere<User>) {
    const user = await userRepository.findOne({ where });
    if (user) {
      await userRepository.delete(where);
    }
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule, ConfigModule.forRoot({ validate, isGlobal: true })],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get<Repository<User>>('USER_REPOSITORY');
    await app.init();

    await userRepository.clear(); // TODO: add docker instance for e2e tests
  });

  describe('POST /user (create new user)', () => {
    const { password: passwordBeforeHash, ...createUserDtoWithoutPassword } =
      createUserDto;
    it('successfully create new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);
      expect(response.body).toMatchObject(createUserDtoWithoutPassword);
      expect(response.body.password).not.toBe(passwordBeforeHash);
      await deleteUsersByID([response.body.id]);
    });
    it('successfully create new user with phone number without country code', async () => {
      const newUserDto: CreateUserDto = { ...createUserDto };
      newUserDto.phoneNumber = '295551234';
      const { password: passwordBeforeHash, ...newUserDtoWithoutPassword } =
        newUserDto;
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(newUserDto)
        .expect(HttpStatus.CREATED);
      expect(response.body).toMatchObject(newUserDtoWithoutPassword);
      expect(response.body.password).not.toBe(passwordBeforeHash);
      await deleteUsersByID([response.body.id]);
    });
    it('failed create new user with too small phone number', async () => {
      const wrongCreateUserDto: CreateUserDto = { ...createUserDto };
      wrongCreateUserDto.phoneNumber = '+375441';
      await request(app.getHttpServer())
        .post('/user')
        .send(wrongCreateUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed create new user with too long phone number', async () => {
      const wrongCreateUserDto: CreateUserDto = { ...createUserDto };
      wrongCreateUserDto.phoneNumber = '+3754411111111';
      await request(app.getHttpServer())
        .post('/user')
        .send(wrongCreateUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed create new user with wrong type phone number', async () => {
      const wrongCreateUserDto: CreateUserDto = { ...createUserDto };
      wrongCreateUserDto.phoneNumber = 'phone';
      await request(app.getHttpServer())
        .post('/user')
        .send(wrongCreateUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed create new user with password without symbol', async () => {
      const wrongCreateUserDto: CreateUserDto = { ...createUserDto };
      wrongCreateUserDto.password = 'weakPassword123';
      await request(app.getHttpServer())
        .post('/user')
        .send(wrongCreateUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed create new user with password without numbers', async () => {
      const wrongCreateUserDto: CreateUserDto = { ...createUserDto };
      wrongCreateUserDto.password = 'weakPassword!';
      await request(app.getHttpServer())
        .post('/user')
        .send(wrongCreateUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed create new user with password without capital letter', async () => {
      const wrongCreateUserDto: CreateUserDto = { ...createUserDto };
      wrongCreateUserDto.password = 'weakpassword123!';
      await request(app.getHttpServer())
        .post('/user')
        .send(wrongCreateUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed create new user with same login', async () => {
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(createUserDto);
      await request(app.getHttpServer())
        .post('/user')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);
      await deleteUsersByID([response.body.id]);
    });
  });

  describe('GET /user/:id (get user by ID)', () => {
    let createdUser: User;
    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(createUserDto);
      createdUser = response.body;
    });
    it('successfully get new user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/user/${createdUser.id}`)
        .expect(HttpStatus.OK);
      expect(response.body).toStrictEqual(createdUser);
    });
    it('failed to get new user by non-uuid id', async () => {
      await request(app.getHttpServer())
        .get(`/user/1`)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed to get new user by wrong id', async () => {
      await request(app.getHttpServer())
        .get(`/user/${uuid.v4()}`)
        .expect(HttpStatus.NOT_FOUND);
    });
    afterAll(async () => {
      await deleteUsersByID([createdUser.id]);
    });
  });

  describe('GET /user (get all users)', () => {
    const createdUsers: User[] = [];
    beforeAll(async () => {
      const secondNewUserDto: CreateUserDto = {
        firstName: 'Bob',
        lastName: 'Johnson',
        phoneNumber: '+375295555678',
        login: 'BobJohnson',
        password: 'Password456!',
      };
      const firstResponse = await request(app.getHttpServer())
        .post('/user')
        .send(createUserDto);
      createdUsers.push(firstResponse.body);
      await deleteUserIfExist({ login: secondNewUserDto.login });
      const secondResponse = await request(app.getHttpServer())
        .post('/user')
        .send(secondNewUserDto);
      createdUsers.push(secondResponse.body);
    });
    it('successfully get all users', async () => {
      const response = await request(app.getHttpServer())
        .get('/user')
        .expect(HttpStatus.OK);
      createdUsers.forEach((createdUser) => {
        expect(response.body).toContainEqual(createdUser);
      });
    });
    it('failed to get empty users', async () => {
      await deleteUsersByID(createdUsers.map((user) => user.id));
      await request(app.getHttpServer())
        .get('/user')
        .expect(HttpStatus.NOT_FOUND);
    });
    afterAll(async () => {
      await deleteUsersByID(createdUsers.map((user) => user.id));
    });
  });

  describe('PATCH /user/:id (update user by id)', () => {
    let createdUser: User;
    const countOfAffectedRows = 1;
    const updateUserDto: UpdateUserDto = {
      firstName: 'Bob',
      lastName: 'Johnson',
      phoneNumber: '+375295555678',
    };
    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(createUserDto);
      createdUser = response.body;
    });
    it('successfully update all user data by id', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/user/${createdUser.id}`)
        .send(updateUserDto)
        .expect(HttpStatus.OK);
      expect(+response.text).toBe(countOfAffectedRows);
    });
    it('successfully update only user firstname by id', async () => {
      const updateUserFirstName: UpdateUserDto = {
        firstName: updateUserDto.firstName,
      };
      const response = await request(app.getHttpServer())
        .patch(`/user/${createdUser.id}`)
        .send(updateUserFirstName)
        .expect(HttpStatus.OK);
      expect(+response.text).toBe(countOfAffectedRows);
    });
    it('successfully update only user lastname by id', async () => {
      const updateUserLastName: UpdateUserDto = {
        lastName: updateUserDto.lastName,
      };
      const response = await request(app.getHttpServer())
        .patch(`/user/${createdUser.id}`)
        .send(updateUserLastName)
        .expect(HttpStatus.OK);
      expect(+response.text).toBe(countOfAffectedRows);
    });
    it('successfully update only user phone number by id', async () => {
      const updateUserPhoneNumber: UpdateUserDto = {
        phoneNumber: updateUserDto.phoneNumber,
      };
      const response = await request(app.getHttpServer())
        .patch(`/user/${createdUser.id}`)
        .send(updateUserPhoneNumber)
        .expect(HttpStatus.OK);
      expect(+response.text).toBe(countOfAffectedRows);
    });
    it('successfully update all user by id', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/user/${createdUser.id}`)
        .send(updateUserDto)
        .expect(HttpStatus.OK);
      expect(+response.text).toBe(countOfAffectedRows);
    });
    it('successfully update user phone number without country code by id', async () => {
      updateUserDto.phoneNumber = '295551234';
      const response = await request(app.getHttpServer())
        .patch(`/user/${createdUser.id}`)
        .send(updateUserDto)
        .expect(HttpStatus.OK);
      expect(+response.text).toBe(countOfAffectedRows);
    });
    it('failed to update user by non-uuid id', async () => {
      await request(app.getHttpServer())
        .patch('/user/1')
        .send(updateUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed to update user by wrong id', async () => {
      await request(app.getHttpServer())
        .patch(`/user/${uuid.v4()}`)
        .send(updateUserDto)
        .expect(HttpStatus.NOT_FOUND);
    });
    it('failed update user with too small phone number', async () => {
      updateUserDto.phoneNumber = '+375441';
      await request(app.getHttpServer())
        .patch(`/user/${createdUser.id}`)
        .send(updateUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed create new user with too long phone number', async () => {
      updateUserDto.phoneNumber = '+3754411111111';
      await request(app.getHttpServer())
        .patch(`/user/${createdUser.id}`)
        .send(updateUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed create new user with wrong type phone number', async () => {
      updateUserDto.phoneNumber = 'phone';
      await request(app.getHttpServer())
        .patch(`/user/${createdUser.id}`)
        .send(updateUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    afterAll(async () => {
      await deleteUsersByID([createdUser.id]);
    });
  });

  describe('DELETE /user/:id (delete user by id)', () => {
    let createdUser: User;
    const countOfAffectedRows = 1;
    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(createUserDto);
      createdUser = response.body;
    });
    it('successfully delete by id', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/user/${createdUser.id}`)
        .expect(HttpStatus.OK);
      expect(+response.text).toBe(countOfAffectedRows);
    });
    it('failed to update user by non-uuid id', async () => {
      await request(app.getHttpServer())
        .delete('/user/1')
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed to update user by wrong id', async () => {
      await request(app.getHttpServer())
        .patch(`/user/${uuid.v4()}`)
        .expect(HttpStatus.NOT_FOUND);
    });
    afterAll(async () => {
      await deleteUsersByID([createdUser.id]);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});

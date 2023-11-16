import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserModule } from '../src/user/user.module';
import { CreateUserDto } from '../src/user/dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from '../src/user/entities/user.entity';
import * as uuid from 'uuid';
import { UpdateUserDto } from '../src/user/dto/update-user.dto';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  function deleteUsersByID(userIDs: string[]) {
    userIDs.map(async () => {
      await userRepository.delete(userIDs);
    });
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get<Repository<User>>('USER_REPOSITORY');
    await app.init();
  });

  describe('POST /user (create new user)', () => {
    let newUserDto: CreateUserDto;
    beforeEach(async () => {
      newUserDto = {
        firstName: 'Alice',
        lastName: 'Smith',
        phoneNumber: '+375295551234',
        login: 'AliceSmith',
        password: 'Password123!',
      };
    });
    it('successfully create new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(newUserDto)
        .expect(HttpStatus.CREATED);
      expect(response.body).toMatchObject(newUserDto);
      deleteUsersByID([response.body.id]);
    });
    it('successfully create new user with phone number without country code', async () => {
      newUserDto.phoneNumber = '295551234';
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(newUserDto)
        .expect(HttpStatus.CREATED);
      expect(response.body).toMatchObject(newUserDto);
      deleteUsersByID([response.body.id]);
    });
    it('failed create new user with too small phone number', async () => {
      newUserDto.phoneNumber = '+375441';
      await request(app.getHttpServer())
        .post('/user')
        .send(newUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed create new user with too long phone number', async () => {
      newUserDto.phoneNumber = '+3754411111111';
      await request(app.getHttpServer())
        .post('/user')
        .send(newUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed create new user with wrong type phone number', async () => {
      newUserDto.phoneNumber = 'phone';
      await request(app.getHttpServer())
        .post('/user')
        .send(newUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed create new user with password without symbol', async () => {
      newUserDto.password = 'weakPassword123';
      await request(app.getHttpServer())
        .post('/user')
        .send(newUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed create new user with password without numbers', async () => {
      newUserDto.password = 'weakPassword!';
      await request(app.getHttpServer())
        .post('/user')
        .send(newUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed create new user with password without capital letter', async () => {
      newUserDto.password = 'weakpassword123!';
      await request(app.getHttpServer())
        .post('/user')
        .send(newUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed create new user with same login', async () => {
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(newUserDto);
      await request(app.getHttpServer())
        .post('/user')
        .send(newUserDto)
        .expect(HttpStatus.BAD_REQUEST);
      deleteUsersByID([response.body.id]);
    });
  });

  describe('GET /user/:id (get user by ID)', () => {
    let createdUser: User;
    beforeAll(async () => {
      const newUser: CreateUserDto = {
        firstName: 'Alice',
        lastName: 'Smith',
        phoneNumber: '+375295551234',
        login: 'AliceSmith',
        password: 'Password123!',
      };
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(newUser);
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
      deleteUsersByID([createdUser.id]);
    });
  });

  describe('GET /user (get all users)', () => {
    const createdUsers: User[] = [];
    beforeAll(async () => {
      const firstNewUserDto: CreateUserDto = {
        firstName: 'Alice',
        lastName: 'Smith',
        phoneNumber: '+375295551234',
        login: 'AliceSmith',
        password: 'Password123!',
      };
      const secondNewUserDto: CreateUserDto = {
        firstName: 'Bob',
        lastName: 'Johnson',
        phoneNumber: '+375295555678',
        login: 'BobJohnson',
        password: 'Password456!',
      };
      const firstResponse = await request(app.getHttpServer())
        .post('/user')
        .send(firstNewUserDto);
      createdUsers.push(firstResponse.body);
      const secondResponse = await request(app.getHttpServer())
        .post('/user')
        .send(secondNewUserDto);
      createdUsers.push(secondResponse.body);
    });
    it('successfully get all users', async () => {
      const response = await request(app.getHttpServer())
        .get('/user')
        .expect(HttpStatus.OK);
      expect(response.body).toStrictEqual(createdUsers);
    });
    it('failed to get empty users', async () => {
      deleteUsersByID(createdUsers.map((user) => user.id));
      await request(app.getHttpServer())
        .get('/user')
        .expect(HttpStatus.NOT_FOUND);
    });
    afterAll(async () => {
      deleteUsersByID(createdUsers.map((user) => user.id));
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
      const newUserDto: CreateUserDto = {
        firstName: 'Alice',
        lastName: 'Smith',
        phoneNumber: '+375295551234',
        login: 'AliceSmith',
        password: 'Password123!',
      };
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(newUserDto);
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
      deleteUsersByID([createdUser.id]);
    });
  });

  describe('DELETE /user/:id (delete user by id)', () => {
    let createdUser: User;
    const countOfAffectedRows = 1;
    beforeAll(async () => {
      const newUserDto: CreateUserDto = {
        firstName: 'Alice',
        lastName: 'Smith',
        phoneNumber: '+375295551234',
        login: 'AliceSmith',
        password: 'Password123!',
      };
      const response = await request(app.getHttpServer())
        .post('/user')
        .send(newUserDto);
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
      deleteUsersByID([createdUser.id]);
    });
  });

  afterAll(async () => {
    await userRepository.clear();
    await app.close();
  });
});
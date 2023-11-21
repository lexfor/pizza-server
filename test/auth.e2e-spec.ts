import { HttpStatus, INestApplication } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from '../src/user/entities/user.entity';
import { CreateUserDto } from '../src/user/dto/create-user.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from '../src/utilities/config/env.validation';
import * as request from 'supertest';
import { SignInDto } from '../src/auth/dto/sign-in.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  const signInDto: SignInDto = {
    login: 'AliceSmith',
    password: 'Password123!',
  };

  const createUserDto: CreateUserDto = {
    firstName: 'Alice',
    lastName: 'Smith',
    phoneNumber: '+375295551234',
    ...signInDto,
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
      imports: [AuthModule, ConfigModule.forRoot({ validate, isGlobal: true })],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get<Repository<User>>('USER_REPOSITORY');
    await app.init();

    await userRepository.clear(); // TODO: add docker instance for e2e tests
  });

  describe('POST /auth/sign-up (create new user)', () => {
    const { password: passwordBeforeHash, ...createUserDtoWithoutPassword } =
      createUserDto;
    it('successfully create new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/sign-up')
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
        .post('/auth/sign-up')
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
        .post('/auth/sign-up')
        .send(wrongCreateUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed create new user with too long phone number', async () => {
      const wrongCreateUserDto: CreateUserDto = { ...createUserDto };
      wrongCreateUserDto.phoneNumber = '+3754411111111';
      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(wrongCreateUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed create new user with wrong type phone number', async () => {
      const wrongCreateUserDto: CreateUserDto = { ...createUserDto };
      wrongCreateUserDto.phoneNumber = 'phone';
      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(wrongCreateUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed create new user with password without symbol', async () => {
      const wrongCreateUserDto: CreateUserDto = { ...createUserDto };
      wrongCreateUserDto.password = 'weakPassword123';
      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(wrongCreateUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed create new user with password without numbers', async () => {
      const wrongCreateUserDto: CreateUserDto = { ...createUserDto };
      wrongCreateUserDto.password = 'weakPassword!';
      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(wrongCreateUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed create new user with password without capital letter', async () => {
      const wrongCreateUserDto: CreateUserDto = { ...createUserDto };
      wrongCreateUserDto.password = 'weakpassword123!';
      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(wrongCreateUserDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('failed create new user with same login', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(createUserDto);
      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);
      await deleteUsersByID([response.body.id]);
    });
  });

  describe('POST /auth/sign-in (get access token by login and password)', () => {
    let createdUser: User;
    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(createUserDto);
      createdUser = response.body;
    });
    it('successfully get access token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(signInDto)
        .expect(HttpStatus.OK);
      expect(response.body.access_token).not.toBeNull();
    });
    it('failed to get access token by wrong login', async () => {
      const wrongSignInDto = { ...signInDto };
      wrongSignInDto.login = 'notExistedLogin';
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(wrongSignInDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('failed to get access token by wrong password', async () => {
      const wrongSignInDto = { ...signInDto };
      wrongSignInDto.password = 'wrongPassword';
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(wrongSignInDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    afterAll(async () => {
      await deleteUsersByID([createdUser.id]);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});

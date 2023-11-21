import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly salt: string;
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    this.salt = bcrypt.genSaltSync(this.configService.get('SALT_ROUNDS'));
  }
  async create(createUserDto: CreateUserDto): Promise<User> {
    createUserDto.password = bcrypt.hashSync(createUserDto.password, this.salt);
    const user: User = this.userRepository.create(createUserDto);
    await this.userRepository.save(user);
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findByID(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByLogin(login: string): Promise<User> {
    return this.userRepository.findOne({ where: { login } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<number> {
    const res = await this.userRepository.update(id, updateUserDto);
    return res.affected;
  }

  async remove(id: string): Promise<number> {
    const res = await this.userRepository.delete(id);
    return res.affected;
  }
}

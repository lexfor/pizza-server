import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { SignInDto } from './dto/sign-in.dto';
import { IJwtToken } from './interfaces/jwt-token.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(signInDto: SignInDto) {
    const user: User = await this.userService.findByLogin(signInDto.login);
    await this.checkIsPasswordCorrect(signInDto.password, user.password);
    return this.createPayload(user);
  }

  private async checkIsPasswordCorrect(
    password: string,
    hashedPassword: string,
  ) {
    if (!bcrypt.compareSync(password, hashedPassword)) {
      throw new HttpException('Password is wrong', HttpStatus.UNAUTHORIZED);
    }
  }

  private async createPayload(user: User): Promise<IJwtToken> {
    const payload = { userID: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

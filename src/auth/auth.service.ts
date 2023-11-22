import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { SignInDto } from './dto/sign-in.dto';
import { IJwtToken } from './interfaces/jwt-token.interface';
import { ConfigService } from '@nestjs/config';
import { IJwtPayload } from './interfaces/jwt-payload.interface';
import { ITokenOptions } from './interfaces/token-options.interface';
import { TokensEnum } from './enums/tokens.enum';
import { UUID } from 'uuid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(signInDto: SignInDto) {
    const user: User = await this.userService.findByLogin(signInDto.login);
    this.checkIsPasswordCorrect(signInDto.password, user.password);
    return this.createTokensByUserID(user.id);
  }

  createTokensByUserID(userID: UUID) {
    const payload: IJwtPayload = this.createPayload(userID);
    return this.createTokens(payload);
  }

  private checkIsPasswordCorrect(password: string, hashedPassword: string) {
    if (!bcrypt.compareSync(password, hashedPassword)) {
      throw new HttpException('Password is wrong', HttpStatus.UNAUTHORIZED);
    }
  }

  private createPayload(userID: UUID): IJwtPayload {
    return { userID };
  }
  private createTokens(payload: IJwtPayload): IJwtToken {
    return {
      access_token: this.createToken(
        payload,
        this.createTokenOptions(TokensEnum.AccessToken),
      ),
      refresh_token: this.createToken(
        payload,
        this.createTokenOptions(TokensEnum.RefreshToken),
      ),
    };
  }

  private createTokenOptions(token: TokensEnum): ITokenOptions {
    switch (token) {
      case TokensEnum.AccessToken:
        return {
          secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
          expiresIn: this.configService.get(
            'JWT_ACCESS_TOKEN_EXPIRATION_TIME_IN_SECONDS',
          ),
        };
      case TokensEnum.RefreshToken:
        return {
          secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn: this.configService.get(
            'JWT_REFRESH_TOKEN_EXPIRATION_TIME_IN_SECONDS',
          ),
        };
    }
  }

  private createToken(payload: IJwtPayload, tokenOptions: ITokenOptions) {
    return this.jwtService.sign(payload, {
      secret: tokenOptions.secret,
      expiresIn: tokenOptions.expiresIn,
    });
  }
}

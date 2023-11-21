import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtFactory } from '../utilities/factories/jwt.factory';
import { CheckIsUserAlreadyExistByLoginMiddleware } from '../user/middlewares/checkIsUserAlreadyExistByLogin.middleware';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CheckIsUserNotExistByLoginMiddleware } from './middlewares/checkIsUserNotExistByLogin.middleware';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: JwtFactory,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CheckIsUserAlreadyExistByLoginMiddleware)
      .forRoutes({ path: '/auth/sign-up', method: RequestMethod.POST })
      .apply(CheckIsUserNotExistByLoginMiddleware)
      .forRoutes({ path: '/auth/sign-in', method: RequestMethod.POST });
  }
}

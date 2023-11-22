import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CheckIsUserAlreadyExistByLoginMiddleware } from '../user/middlewares/checkIsUserAlreadyExistByLogin.middleware';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CheckIsUserNotExistByLoginMiddleware } from './middlewares/checkIsUserNotExistByLogin.middleware';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [UserModule, PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService, JwtStrategy],
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

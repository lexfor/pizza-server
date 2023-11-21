import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from '../database/database.module';
import { userProviders } from './user.providers';
import { CheckIsUserAlreadyExistByLoginMiddleware } from './middlewares/checkIsUserAlreadyExistByLogin.middleware';
import { CheckIsUserNotExistByIDMiddleware } from './middlewares/checkIsUserNotExistByID.middleware';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserService, ...userProviders],
  exports: [UserService, ...userProviders],
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CheckIsUserAlreadyExistByLoginMiddleware)
      .forRoutes({ path: '/user', method: RequestMethod.POST })
      .apply(CheckIsUserNotExistByIDMiddleware)
      .forRoutes(
        { path: '/user/:id', method: RequestMethod.GET },
        { path: '/user/:id', method: RequestMethod.PATCH },
        { path: '/user/:id', method: RequestMethod.DELETE },
      );
  }
}

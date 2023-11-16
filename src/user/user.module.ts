import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from '../database/database.module';
import { userProviders } from './providers/user.providers';
import { IsUserWithSameLoginAlreadyExistMiddleware } from './middlewares/isUserWithSameLoginAlreadyExist.middleware';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserService, ...userProviders],
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(IsUserWithSameLoginAlreadyExistMiddleware)
      .forRoutes({ path: '/user', method: RequestMethod.POST });
  }
}

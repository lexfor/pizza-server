import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { validate } from './utilities/config/env.validation';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({ validate, isGlobal: true }),
    DatabaseModule,
  ],
})
export class AppModule {}

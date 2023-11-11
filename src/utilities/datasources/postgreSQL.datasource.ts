import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../../user/entities/user.entity';
import { CreateUserTable1699623230383 } from '../migrations/1699623230383-create-user-table';

ConfigModule.forRoot();
const configService = new ConfigService();
export const dataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'), // TODO: Add .env validation
  port: configService.get<number>('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [User], // TODO: get it out of datasource implementation
  synchronize: false,
  migrations: [CreateUserTable1699623230383], // TODO: get it out of datasource implementation
});

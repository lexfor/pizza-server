import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export function JwtFactory(configService: ConfigService): JwtModuleOptions {
  return {
    secret: configService.get('JWT_SECRET'),
    signOptions: { expiresIn: configService.get('') },
  };
}

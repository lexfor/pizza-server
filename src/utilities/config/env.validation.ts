import { plainToClass } from 'class-transformer';
import { IsNumber, IsString, MinLength, validateSync } from 'class-validator';

const countOfMinimalCharacters = 10;

class EnvironmentVariables {
  @IsNumber()
  PORT: number;

  @IsString()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  DB_NAME: string;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsNumber()
  SALT_ROUNDS: number;

  @IsString()
  @MinLength(countOfMinimalCharacters)
  JWT_SECRET: string;
}

export function validate(configuration: Record<string, unknown>) {
  const finalConfig = plainToClass(EnvironmentVariables, configuration, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(finalConfig);

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return finalConfig;
}

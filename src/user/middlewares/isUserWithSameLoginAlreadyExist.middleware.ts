import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class IsUserWithSameLoginAlreadyExistMiddleware
  implements NestMiddleware
{
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if (await this.isUserWithSameLoginAlreadyExist(req.body.login || '')) {
      res.status(400).json('User with the same login already exist');
    } else {
      next();
    }
  }

  async isUserWithSameLoginAlreadyExist(login: string): Promise<boolean> {
    const users = await this.userRepository.find({ where: { login } });
    return users.length > 0;
  }
}

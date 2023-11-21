import { HttpStatus, Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class CheckIsUserAlreadyExistByLoginMiddleware
  implements NestMiddleware
{
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if (await this.isUserWithSameLoginAlreadyExist(req.body.login || '')) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json('User with the same login already exist');
    } else {
      next();
    }
  }

  async isUserWithSameLoginAlreadyExist(login: string): Promise<boolean> {
    return !!(await this.userRepository.findOne({ where: { login } }));
  }
}

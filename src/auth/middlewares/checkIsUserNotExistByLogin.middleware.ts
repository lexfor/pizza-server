import { HttpStatus, Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class CheckIsUserNotExistByLoginMiddleware implements NestMiddleware {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if (await this.isUserNotExist(req.body.login)) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json('User with that login is not exist');
    } else {
      next();
    }
  }

  async isUserNotExist(login: string): Promise<boolean> {
    return !(await this.userRepository.findOne({ where: { login } }));
  }
}

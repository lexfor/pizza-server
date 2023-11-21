import { HttpStatus, Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { isUUID } from 'class-validator';

@Injectable()
export class CheckIsUserNotExistByIDMiddleware implements NestMiddleware {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const userID = req.params.id;
    if (!isUUID(userID)) {
      res.status(HttpStatus.BAD_REQUEST).json('Wrong UUID format of user ID');
    } else if (await this.isUserNotExist(userID)) {
      res.status(HttpStatus.NOT_FOUND).json('User with that id is not exist');
    } else {
      next();
    }
  }

  async isUserNotExist(id: string): Promise<boolean> {
    return !(await this.userRepository.findOne({ where: { id } }));
  }
}

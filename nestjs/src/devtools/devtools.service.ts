import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@entities/user';

@Injectable()
export class DevtoolsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async getUsers() {
    return this.userRepository.find();
  }

  async getUserById({ id }: { id: number }) {
    return this.userRepository.findBy({ id });
  }
}

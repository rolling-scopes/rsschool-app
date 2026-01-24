import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TestUser } from '../models/testUser';
import { Repository } from 'typeorm';

@Injectable()
export class DevtoolsService {
  constructor(
    @InjectRepository(TestUser)
    private testUserRepository: Repository<TestUser>,
  ) {}
  async getTestUsers(): Promise<TestUser[]> {
    return this.testUserRepository.find();
  }
}

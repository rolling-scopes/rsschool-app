import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestUser } from './entities/testUser';
import { CreateTestUserDto } from './dto/create-testUser.dto';
import { UpdateTestUserDto } from './dto/update-testUser.dto';

@Injectable()
export class DevtoolsService {
  constructor(
    @InjectRepository(TestUser)
    private testUserRepository: Repository<TestUser>,
  ) {}
  async getTestUsers() {
    return this.testUserRepository.find();
  }

  async getTestUserById({ id }: { id: string }) {
    return this.testUserRepository.findBy({ id });
  }

  async createTestUser({ dto }: { dto: CreateTestUserDto }) {
    return this.testUserRepository.save(dto);
  }

  async updateTestUserById({ id, dto }: { id: string; dto: UpdateTestUserDto }) {
    return this.testUserRepository.update(id, dto);
  }

  async deleteTestUserById({ id }: { id: string }) {
    return this.testUserRepository.delete(id);
  }
}

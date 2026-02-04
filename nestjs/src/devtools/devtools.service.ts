import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@entities/user';

@Injectable()
export class DevtoolsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
  }

  async getUsers() {
    const users = await this.userRepository.find({
      select: {
        id: true,
        githubId: true,
        students: {
          courseId: true,
        },
        mentors: {
          courseId: true,
        },
      },
      relations: ['students', 'mentors'],
    });
    return users.map(({id, githubId, students, mentors}) => ({
      id,
      githubId,
      mentor: mentors?.map(({courseId}) => courseId) || [],
      student: students?.map(({courseId}) => courseId) || [],
    }))
  }

  async getUserById({ id }: { id: number }) {
    return this.userRepository.findBy({ id });
  }
}

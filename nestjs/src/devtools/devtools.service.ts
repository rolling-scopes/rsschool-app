import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@entities/user';
import { ConfigService } from '../config';

@Injectable()
export class DevtoolsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async getUsers() {
    const users = await this.userRepository.find({
      select: {
        id: true,
        githubId: true,
        students: {
          courseId: true,
          course: {
            alias: true,
          },
        },
        mentors: {
          courseId: true,
          course: {
            alias: true,
          },
        },
      },
      relations: ['students.course', 'mentors.course'],
    });
    return users.map(({ id, githubId, students, mentors }) => ({
      id,
      githubId,
      mentor: mentors?.map(({ course }) => course?.alias) || [],
      student: students?.map(({ course }) => course?.alias) || [],
      students,
    }));
  }

  async getDevUserLogin({ githubId }: { githubId: string }) {
    this.configService.authWithDevUser(githubId);
  }
}

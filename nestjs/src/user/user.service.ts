import { User } from '@entities/user';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  public getFullUserByGithubId(id: string) {
    const githubId = id.toLowerCase();

    return this.userRepository.findOne({
      where: { githubId },
      relations: ['mentors', 'students', 'courseUsers'],
    });
  }

  public getUserByProvider(provider: string, providerUserId: string) {
    return this.userRepository.findOne({
      where: { provider, providerUserId },
      relations: [
        'mentors',
        'students',
        'mentors.course',
        'students.course',
        'courseManagers',
        'courseManagers.course',
      ],
    });
  }

  public saveUser(user: Partial<User>) {
    return this.userRepository.save(user);
  }
}

import { User } from '@entities/user';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  public async getByGithubId(id: string) {
    const githubId = id.toLowerCase();

    const [user] = await this.userRepository.find({ where: { githubId } });
    if (user == null) {
      return null;
    }
    return user;
  }

  public getUserByProvider(provider: string, providerUserId: string) {
    return this.userRepository.findOne({
      where: { provider, providerUserId },
      relations: ['mentors', 'students', 'mentors.course', 'students.course', 'courseUsers', 'courseUsers.course'],
    });
  }

  public saveUser(user: Partial<User>) {
    return this.userRepository.save(user);
  }

  public getUserByUserId(userId: number) {
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RepositoryEvent } from '@entities/repositoryEvent';
import { Student } from '@entities/student';
import { User } from '@entities/user';
import { CreateRepositoryEventDto } from './dto';

@Injectable()
export class RepositoriesService {
  constructor(
    @InjectRepository(RepositoryEvent)
    private readonly repositoryEventRepository: Repository<RepositoryEvent>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async createEvents(events: CreateRepositoryEventDto[]): Promise<void> {
    const uniqueGithubIds = [...new Set(events.map(e => e.githubId))];
    const users = await this.userRepository.find({
      select: ['id', 'githubId'],
      where: { githubId: In(uniqueGithubIds) },
    });
    const githubIdToUserId = new Map(users.map(u => [u.githubId, u.id]));

    const eventsToSave = events.map(event => ({ ...event, userId: githubIdToUserId.get(event.githubId) }));
    await this.repositoryEventRepository.save(eventsToSave);

    const uniqueUrls = [...new Set(events.map(e => e.repositoryUrl))];
    await Promise.all(uniqueUrls.map(url => this.updateRepositoryActivity(url)));
  }

  private async updateRepositoryActivity(repositoryUrl: string): Promise<void> {
    await this.studentRepository.update({ repository: repositoryUrl }, { repositoryLastActivityDate: new Date() });
  }
}


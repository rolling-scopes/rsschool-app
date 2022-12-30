import { TeamDistribution } from '@entities/teamDistribution';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TeamDistributionService {
  constructor(
    @InjectRepository(TeamDistribution)
    private repository: Repository<TeamDistribution>,
  ) {}

  public async create(data: Partial<TeamDistribution>) {
    return this.repository.save(data);
  }

  public async findByCourseId(courseId: number) {
    return this.repository.find({
      where: { courseId },
      order: {
        startDate: 'ASC',
      },
    });
  }

  public async update(id: number, teamDistribution: Partial<TeamDistribution>) {
    return this.repository.update(id, teamDistribution);
  }

  public async remove(id: number) {
    await this.repository.delete(id);
  }
}

import { Student } from '@entities/index';
import { TeamDistribution } from '@entities/teamDistribution';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export enum registrationStatusEnum {
  Available = 'available',
  Unavailable = 'unavailable',
  Future = 'future',
  Completed = 'completed',
  Closed = 'closed',
}

@Injectable()
export class TeamDistributionService {
  constructor(
    @InjectRepository(TeamDistribution)
    private repository: Repository<TeamDistribution>,
    @InjectRepository(Student)
    readonly studentRepository: Repository<Student>,
  ) {}

  public async create(data: Partial<TeamDistribution>) {
    return this.repository.save(data);
  }

  private getDistributionStatus(distribution: TeamDistribution, student: Student | null) {
    if (student == null || student.isExpelled) {
      return registrationStatusEnum.Unavailable;
    }

    const currTimestampUTC = Date.now();
    const distributionStartDate = distribution.startDate.getTime();
    if (currTimestampUTC < distributionStartDate) {
      return registrationStatusEnum.Future;
    }

    //tbd: add status completed

    const distributionEndDate = distribution.endDate.getTime();
    if (currTimestampUTC <= distributionEndDate && currTimestampUTC >= distributionStartDate) {
      return registrationStatusEnum.Available;
    }

    if (currTimestampUTC > distributionEndDate) {
      return registrationStatusEnum.Closed;
    }

    return registrationStatusEnum.Unavailable;
  }

  public async findByCourseId(courseId: number, student: Student | null) {
    const data = await this.repository.find({
      where: { courseId },
      order: {
        startDate: 'ASC',
      },
    });
    return data.map(el => ({ ...el, registrationStatus: this.getDistributionStatus(el, student) }));
  }

  public async update(id: number, teamDistribution: Partial<TeamDistribution>) {
    return this.repository.update(id, teamDistribution);
  }

  public async remove(id: number) {
    await this.repository.delete(id);
  }
}

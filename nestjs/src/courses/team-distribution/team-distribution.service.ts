import { Student } from '@entities/index';
import { TeamDistribution } from '@entities/teamDistribution';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { Repository } from 'typeorm';

export enum registrationStatusEnum {
  Available = 'available',
  Unavailable = 'unavailable',
  Future = 'future',
  Completed = 'completed',
  Distributed = 'distributed',
  Closed = 'closed',
}

@Injectable()
export class TeamDistributionService {
  constructor(
    @InjectRepository(TeamDistribution)
    private repository: Repository<TeamDistribution>,
  ) {}

  public async create(data: Partial<TeamDistribution>) {
    return this.repository.save(data);
  }

  public addStatusToDistribution(distribution: TeamDistribution, student: Student | null) {
    if (student == null || student.isExpelled || distribution.minTotalScore > student.totalScore) {
      return { ...distribution, registrationStatus: registrationStatusEnum.Unavailable };
    }

    const currTimestampUTC = dayjs();
    const distributionStartDate = dayjs(distribution.startDate);
    if (currTimestampUTC < distributionStartDate) {
      return { ...distribution, registrationStatus: registrationStatusEnum.Future };
    }

    if (student.teamDistributionStudents?.find(el => el.teamDistributionId === distribution.id)?.distributed) {
      return { ...distribution, registrationStatus: registrationStatusEnum.Distributed };
    }

    if (student.teamDistributionStudents?.find(el => el.teamDistributionId === distribution.id)?.active) {
      return { ...distribution, registrationStatus: registrationStatusEnum.Completed };
    }

    const distributionEndDate = dayjs(distribution.endDate);
    if (currTimestampUTC <= distributionEndDate && currTimestampUTC >= distributionStartDate) {
      return { ...distribution, registrationStatus: registrationStatusEnum.Available };
    }

    if (currTimestampUTC > distributionEndDate) {
      return { ...distribution, registrationStatus: registrationStatusEnum.Closed };
    }

    return { ...distribution, registrationStatus: registrationStatusEnum.Unavailable };
  }

  public async findByCourseId(courseId: number) {
    return this.repository.find({
      where: { courseId },
      order: {
        startDate: 'ASC',
      },
    });
  }

  public getById(id: number) {
    return this.repository.findOneOrFail({ where: { id } });
  }

  public async getDistributionDetailedById(id: number) {
    const teamDistribution = await this.repository.findOneOrFail({
      where: {
        id,
      },
      relations: ['teams', 'teamDistributionStudents'],
    });
    return teamDistribution;
  }

  public async update(id: number, teamDistribution: Partial<TeamDistribution>) {
    return this.repository.update(id, teamDistribution);
  }

  public async remove(id: number) {
    await this.repository.delete(id);
  }
}

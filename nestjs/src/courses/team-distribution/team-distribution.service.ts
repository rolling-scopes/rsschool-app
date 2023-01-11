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
    if (student == null || student.isExpelled || distribution.minTotalScore > student.totalScore) {
      return registrationStatusEnum.Unavailable;
    }

    const currTimestampUTC = dayjs();
    const distributionStartDate = dayjs(distribution.startDate);
    if (currTimestampUTC < distributionStartDate) {
      return registrationStatusEnum.Future;
    }

    if (student.teamDistribution.find(el => el.id === distribution.id)) {
      return registrationStatusEnum.Completed;
    }

    const distributionEndDate = dayjs(distribution.endDate);
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

  public getById(id: number) {
    return this.repository.findOneOrFail({ where: { id } });
  }

  public getDistributionDetailedById(id: number) {
    return this.repository.findOneOrFail({ where: { id }, relations: ['teams', 'studentsWithoutTeam'] });
  }

  public async getStudentsWithoutTeam(id: number) {
    const { studentsWithoutTeam } = await this.repository
      .createQueryBuilder('teamDistribution')
      .where({ id })
      .leftJoin('teamDistribution.studentsWithoutTeam', 'student')
      .orderBy('student.rank', 'ASC')
      .addOrderBy('student.id', 'ASC')
      .leftJoin('student.user', 'user')
      .addSelect(this.getUserFields())
      .addSelect(['student.rank', 'student.totalScore'])
      .getOneOrFail();
    return studentsWithoutTeam;
  }

  private getUserFields = (modelName = 'user') => [
    `${modelName}.contactsTelegram`,
    `${modelName}.contactsSkype`,
    `${modelName}.contactsEmail`,
    `${modelName}.discord`,
    `${modelName}.githubId`,
    `${modelName}.firstName`,
    `${modelName}.lastName`,
    `${modelName}.cvLink`,
    `${modelName}.cityName`,
    `${modelName}.countryName`,
  ];

  public async update(id: number, teamDistribution: Partial<TeamDistribution>) {
    return this.repository.update(id, teamDistribution);
  }

  public async remove(id: number) {
    await this.repository.delete(id);
  }
}

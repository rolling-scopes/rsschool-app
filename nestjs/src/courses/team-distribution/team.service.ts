import { Team } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private repository: Repository<Team>,
  ) {}

  public async getTeamByStudentId(studentId: number, distributionId: number) {
    return this.repository
      .createQueryBuilder('team')
      .innerJoin('team.teamDistribution', 'td')
      .leftJoin('team.students', 's')
      .where('td."id" = :distributionId', { distributionId })
      .andWhere('s.id IN (:...ids)', { ids: [studentId] })
      .getOne();
  }
}

import { Team } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'src/core/paginate';
import { Repository } from 'typeorm';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private repository: Repository<Team>,
  ) {}

  private generatePassword(length = 6): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  public async create(data: Partial<Team>) {
    if (data.students?.length) {
      const [lead] = data.students.sort((a, b) => a.rank - b.rank);
      data.teamLeadId = lead?.id;
    }
    const team = await this.repository.save({ ...data, password: this.generatePassword() });

    return this.repository
      .createQueryBuilder('team')
      .where({ id: team.id })
      .leftJoinAndSelect('team.students', 's')
      .leftJoinAndSelect('s.user', 'u')
      .getOneOrFail();
  }

  public async findById(id: number) {
    return this.repository.findOneOrFail({ where: { id }, relations: ['students', 'teamDistribution'] });
  }

  public async findByDistributionId(
    distributionId: number,
    {
      page = 1,
      limit = 10,
    }: {
      page: number;
      limit: number;
    },
  ) {
    const query = this.repository
      .createQueryBuilder('team')
      .where('team."teamDistributionId" = :distributionId', { distributionId })
      .leftJoinAndSelect('team.students', 's')
      .leftJoinAndSelect('s.user', 'u')
      .orderBy('team.id', 'ASC');

    const { items: teams, meta: paginationMeta } = await paginate(query, { page, limit });
    return { teams, paginationMeta };
  }
}

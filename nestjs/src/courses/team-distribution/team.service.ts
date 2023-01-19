import { Team } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'src/core/paginate';
import { Repository } from 'typeorm';
import { UpdateTeamDto } from './dto';

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
    return this.repository.save({ ...data, password: this.generatePassword() });
  }

  public async remove(id: number) {
    await this.repository.delete(id);
  }

  public async findById(id: number) {
    return this.repository.findOneOrFail({ where: { id }, relations: ['students', 'teamDistribution'] });
  }

  private getUserFields(modelName = 'user') {
    return [
      `${modelName}.firstName`,
      `${modelName}.lastName`,
      `${modelName}.cvLink`,
      `${modelName}.discord`,
      `${modelName}.contactsTelegram`,
      `${modelName}.contactsEmail`,
      `${modelName}.githubId`,
      `${modelName}.cityName`,
      `${modelName}.countryName`,
    ];
  }

  private getStudentsFields(modelName = 'student') {
    return [`${modelName}.id`, `${modelName}.rank`, `${modelName}.totalScore`];
  }

  public async getStudentsCountInTeam(id: number) {
    const { studentsCount } = await this.repository
      .createQueryBuilder('team')
      .where({ id })
      .leftJoin('team.students', 's')
      .select('COUNT(s.id)', 'studentsCount')
      .getRawOne();
    return Number(studentsCount);
  }

  public async findTeamWithStudentsById(id: number) {
    return this.repository
      .createQueryBuilder('team')
      .where({ id })
      .leftJoin('team.students', 's')
      .leftJoin('s.user', 'u')
      .addSelect(this.getStudentsFields('s'))
      .addSelect(this.getUserFields('u'))
      .getOneOrFail();
  }

  public async update(id: number, data: UpdateTeamDto) {
    return this.repository.update(id, data);
  }

  public async findByDistributionId(distributionId: number, { page = 1, limit = 10 }) {
    const query = this.repository
      .createQueryBuilder('team')
      .where('team."teamDistributionId" = :distributionId', { distributionId })
      .leftJoin('team.students', 's')
      .leftJoin('s.user', 'u')
      .addSelect(this.getStudentsFields('s'))
      .addSelect(this.getUserFields('u'))
      .orderBy('team.id', 'ASC');

    const { items: teams, meta: paginationMeta } = await paginate(query, { page, limit });
    return { teams, paginationMeta };
  }
}

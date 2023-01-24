import { Student, Team, TeamDistributionStudent } from '@entities/index';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { customAlphabet } from 'nanoid/async';
import { paginate } from 'src/core/paginate';
import { DataSource, Repository } from 'typeorm';
import { UpdateTeamDto } from './dto';
import { TeamDistributionStudentService } from './team-distribution-student.service';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private repository: Repository<Team>,
    private teamDistributionStudentService: TeamDistributionStudentService,
    private dataSource: DataSource,
  ) {}

  private async generatePassword(length = 6): Promise<string> {
    const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', length);
    const password = await nanoid();
    return password;
  }

  public async create(data: Partial<Team>) {
    if (data.students?.length) {
      const [lead] = data.students.sort((a, b) => a.rank - b.rank);
      data.teamLeadId = lead?.id;
    }
    const password = await this.generatePassword();
    return this.repository.save({ ...data, password });
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
      .leftJoin('u.resume', 'r')
      .addSelect(this.getStudentsFields('s'))
      .addSelect(this.getUserFields('u'))
      .addSelect('r.uuid')
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
      .leftJoin('u.resume', 'r')
      .addSelect('r.uuid')
      .addSelect(this.getStudentsFields('s'))
      .addSelect(this.getUserFields('u'))
      .orderBy('team.id', 'ASC');

    const { items: teams, meta: paginationMeta } = await paginate(query, { page, limit });
    return { teams, paginationMeta };
  }

  public async deleteStudentFromTeam(teamId: number, studentId: number, teamDistributionId: number) {
    const team = await this.findTeamWithStudentsById(teamId);
    team.students = team.students.filter(s => s.id !== studentId);
    if (team.teamLeadId === studentId) {
      const [lead] = team.students.sort((a, b) => a.rank - b.rank);
      team.teamLeadId = lead?.id ?? 0;
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(team);
      const record = await this.teamDistributionStudentService.getTeamDistributionStudent(
        studentId,
        teamDistributionId,
      );
      await queryRunner.manager.update(TeamDistributionStudent, record.id, { distributed: false });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  public async addStudentToTeam(team: Team, student: Student, teamDistributionId: number) {
    team.students.push(student);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(team);
      const record = await this.teamDistributionStudentService.getTeamDistributionStudent(
        student.id,
        teamDistributionId,
      );
      await queryRunner.manager.update(TeamDistributionStudent, record.id, { distributed: true });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }
}

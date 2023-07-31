import { Student, Team, TeamDistributionStudent } from '@entities/index';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isEqual } from 'lodash';
import { customAlphabet } from 'nanoid/async';
import { paginate } from 'src/core/paginate';
import { Brackets, DataSource, Repository } from 'typeorm';
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

  public async generatePassword(length = 6): Promise<string> {
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

  public async editTeamSquad(team: Team, studentIds: number[], distributionId: number, courseId: number) {
    const students = await this.teamDistributionStudentService.getStudentsForTeamByManager(
      studentIds ?? [],
      distributionId,
      courseId,
      team.id,
    );

    const notDistributedStudentIds = team.students
      .filter(student => !studentIds?.includes(student.id))
      .map(student => student.id);
    const distributedStudentIds = studentIds?.filter(id => !team.students.find(el => el.id === id));

    const studentsNeedingUpdate = await this.teamDistributionStudentService.findByStudentIds(
      [...notDistributedStudentIds, ...distributedStudentIds],
      distributionId,
    );

    const notDistributedStudents = studentsNeedingUpdate
      .filter(student => notDistributedStudentIds.includes(student.studentId))
      .map(student => ({ ...student, distributed: false }));
    const distributedStudents = studentsNeedingUpdate
      .filter(student => distributedStudentIds.includes(student.studentId))
      .map(student => ({ ...student, distributed: true }));

    await this.teamDistributionStudentService.saveTeamDistributionStudents([
      ...notDistributedStudents,
      ...distributedStudents,
    ]);

    let teamLeadId = team.teamLeadId;
    if (notDistributedStudentIds.includes(team.teamLeadId)) {
      teamLeadId = students.sort((a, b) => a.rank - b.rank)[0]?.id ?? team.teamLeadId;
    }

    return { students, teamLeadId };
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

  public async save(teamId: number, dto: UpdateTeamDto, distributionId: number, courseId: number) {
    const team = await this.findById(teamId);
    let students = team.students;
    let teamLeadId = team.teamLeadId;
    if (
      dto.studentIds &&
      !isEqual(
        dto.studentIds,
        team.students.map(student => student.id),
      )
    ) {
      const res = await this.editTeamSquad(team, dto.studentIds, distributionId, courseId);
      students = res.students;
      teamLeadId = res.teamLeadId;
    }
    const data = { ...team, ...dto, students, teamLeadId };
    return this.repository.save(data);
  }

  public async update(id: number, data: UpdateTeamDto) {
    return this.repository.update(id, data);
  }

  public async updatePassword(id: number, password: string) {
    return this.repository.update(id, { password: password });
  }

  public async findAllByDistributionId(distributionId: number) {
    const teams = await this.repository
      .createQueryBuilder('team')
      .where('team."teamDistributionId" = :distributionId', { distributionId })
      .leftJoin('team.students', 's')
      .leftJoin('s.user', 'u')
      .addSelect(this.getStudentsFields('s'))
      .addSelect(this.getUserFields('u'))
      .orderBy('team.id', 'ASC')
      .getMany();

    return teams;
  }

  public async getCountByDistributionId(distributionId: number) {
    return this.repository.count({
      where: { teamDistributionId: distributionId },
    });
  }

  private getSearchString() {
    const searchConfig = [
      { field: '"githubId"' },
      { field: '"firstName"' },
      { field: '"lastName"' },
      { field: '"cityName"' },
      { field: '"countryName"' },
    ];

    return searchConfig.map(({ field }) => `"u".${field} ilike :search`).join(' OR ');
  }

  private getSearchConditions(search: string) {
    return new Brackets(qb => {
      qb.where(this.getSearchString(), { search: `${search}%` })
        .orWhere(`CAST(u.discord AS jsonb)->>'username' ILIKE :search`, { search: `${search}%` })
        .orWhere(`team.name ilike :search`, { search: `${search}%` });
    });
  }

  public async findByDistributionId(distributionId: number, { search = '', page = 1, limit = 10 }) {
    let matchingTeamIds: number[] = [];

    if (search) {
      // find all the teams that have at least one student matching the search query
      const teamsQuery = this.repository
        .createQueryBuilder('team')
        .select('team.id')
        .leftJoin('team.students', 's')
        .leftJoin('s.user', 'u')
        .leftJoin('u.resume', 'r')
        .where('team."teamDistributionId" = :distributionId', { distributionId })
        .andWhere(this.getSearchConditions(search));

      matchingTeamIds = (await teamsQuery.getMany()).map(team => team.id);
    }

    const query = this.repository
      .createQueryBuilder('team')
      .where('team."teamDistributionId" = :distributionId', { distributionId })
      .andWhere(matchingTeamIds.length > 0 ? 'team.id IN (:...matchingTeamIds)' : '1=1', { matchingTeamIds })
      .leftJoinAndSelect('team.students', 's')
      .leftJoinAndSelect('s.user', 'u')
      .leftJoinAndSelect('u.resume', 'r')
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

  public async getTeamsAvailableForDistribute(teamDistributionId: number, teamSize: number) {
    const res = await this.repository
      .createQueryBuilder('team')
      .where('team."teamDistributionId" = :teamDistributionId', { teamDistributionId })
      .leftJoinAndSelect('team.students', 'students')
      .getMany();
    return res.filter(t => t.students.length < teamSize).sort((a, b) => a.students.length - b.students.length);
  }
}

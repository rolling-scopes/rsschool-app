import { Student, TeamDistributionStudent } from '@entities/index';
import { TeamDistribution } from '@entities/teamDistribution';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, FindOptionsRelations, In, Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { paginate } from 'src/core/paginate';

@Injectable()
export class TeamDistributionStudentService {
  constructor(
    @InjectRepository(TeamDistributionStudent)
    private repository: Repository<TeamDistributionStudent>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(TeamDistribution)
    private teamDistributionRepository: Repository<TeamDistribution>,
  ) {}

  public async getTeamDistributionStudent(studentId: number, teamDistributionId: number, withStudentData = false) {
    return this.repository.findOneOrFail({
      where: { studentId, teamDistributionId },
      relations: withStudentData ? ['student'] : [],
    });
  }

  private async getStudentsWithTeams(studentIds: number[]) {
    return this.studentRepository.find({
      where: { id: In(studentIds) },
      relations: ['teams'],
    });
  }

  private getDistributionById(id: number) {
    return this.teamDistributionRepository.findOneOrFail({ where: { id } });
  }

  private verifyTeamSize(students: Student[], strictTeamSize: number) {
    if (strictTeamSize < students.length) {
      throw new BadRequestException('The number of students in the team has been exceeded.');
    }
  }

  private verifyStudentTeams(students: Student[], teamDistributionId: number, teamId?: number) {
    if (
      students.some(student =>
        student.teams.some(team => team.teamDistributionId === teamDistributionId && team.id !== teamId),
      )
    ) {
      throw new BadRequestException('One of the students is already on the team for the current distribution');
    }
  }

  private async verifyRegisteredStudents(
    studentIds: number[],
    registeredStudents: TeamDistributionStudent[],
    teamDistributionId: number,
    courseId: number,
  ) {
    if (registeredStudents.length !== studentIds.length) {
      const notRegisteredStudentIds = studentIds.filter(id => !registeredStudents.find(el => el.studentId === id));
      await this.addStudentsToTeamDistribution(notRegisteredStudentIds, teamDistributionId, courseId);
    }
  }

  public async getStudentsForTeamByManager(
    studentIds: number[],
    teamDistributionId: number,
    courseId: number,
    teamId?: number,
  ) {
    const students = await this.getStudentsWithTeams(studentIds);
    if (students.length === 0) {
      throw new BadRequestException();
    }
    const teamDistribution = await this.getDistributionById(teamDistributionId);

    this.verifyTeamSize(students, teamDistribution.strictTeamSize);
    this.verifyStudentTeams(students, teamDistributionId, teamId);

    const registeredStudents = await this.getTeamDistributionStudents(studentIds, teamDistributionId, courseId);

    await this.verifyRegisteredStudents(studentIds, registeredStudents, teamDistributionId, courseId);
    return students;
  }

  public async getTeamDistributionStudents(studentIds: number[], teamDistributionId: number, courseId: number) {
    return this.repository.find({
      where: { courseId, studentId: In(studentIds), teamDistributionId },
    });
  }

  public async addStudentsToTeamDistribution(studentIds: number[], teamDistributionId: number, courseId: number) {
    await this.repository.save(studentIds.map(id => ({ studentId: id, teamDistributionId, courseId })));
  }

  private verifyDateWithinDistributionPeriod(startDate: Date, endDate: Date) {
    const currentDate = dayjs();
    const distributionStartDate = dayjs(startDate);
    const distributionEndDate = dayjs(endDate);
    if (currentDate < distributionStartDate || currentDate > distributionEndDate) {
      throw new BadRequestException();
    }
  }

  public async addStudentToTeamDistribution(
    studentId: number,
    teamDistribution: TeamDistribution,
    courseId: number,
    withVerification = true,
  ) {
    if (withVerification) {
      this.verifyDateWithinDistributionPeriod(teamDistribution.startDate, teamDistribution.endDate);
    }
    const record = await this.repository.findOne({
      where: { studentId, courseId, teamDistributionId: teamDistribution.id },
    });

    if (record?.active || record?.distributed) {
      throw new BadRequestException();
    }
    const student = await this.studentRepository.findOneOrFail({
      where: { id: studentId },
    });

    if (withVerification && student.totalScore < teamDistribution.minTotalScore) {
      throw new BadRequestException('Number of points is less than the input threshold for distribution');
    }

    record
      ? await this.repository.update(record.id, { active: true })
      : await this.repository.save({
          studentId: studentId,
          courseId: teamDistribution.courseId,
          teamDistributionId: teamDistribution.id,
        });
  }

  public async deleteStudentFromTeamDistribution(studentId: number, teamDistributionId: number) {
    const record = await this.repository.findOne({
      where: { studentId, teamDistributionId },
    });
    if (record == null) throw new NotFoundException();
    await this.repository.update(record.id, { active: false });
  }

  public async markStudentAsDistributed(studentId: number, teamDistributionId: number) {
    const record = await this.repository.findOne({
      where: { studentId, teamDistributionId },
    });
    if (record == null) throw new NotFoundException();
    await this.repository.update(record.id, { distributed: true });
  }

  public async findByStudentIds(studentIds: number[], teamDistributionId: number) {
    const records = await this.repository.find({
      where: { studentId: In(studentIds), teamDistributionId },
    });
    return records;
  }

  public async saveTeamDistributionStudents(teamDistributionStudents: TeamDistributionStudent[]) {
    return this.repository.save(teamDistributionStudents);
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

  private getSearchString() {
    const searchConfig = [
      { field: '"githubId"' },
      { field: '"firstName"' },
      { field: '"lastName"' },
      { field: '"cityName"' },
      { field: '"countryName"' },
    ];

    return searchConfig.map(({ field }) => `"user".${field} ilike :search`).join(' OR ');
  }

  public async getStudentsByTeamDistributionId(distributionId: number, { search = '', page = 1, limit = 10 }) {
    const query = this.studentRepository
      .createQueryBuilder('student')
      .leftJoin('student.teamDistributionStudents', 'tds')
      .innerJoin('student.user', 'user')
      .leftJoin('user.resume', 'resume')
      .addSelect('resume.uuid')
      .addSelect(this.getUserFields());

    if (search) {
      query
        .where(
          new Brackets(qb => {
            qb.where(this.getSearchString(), { search: search + '%' }).orWhere(
              `CAST(user.discord AS jsonb)->>'username' ILIKE :search`,
              { search: search + '%' },
            );
          }),
        )
        .andWhere('tds.teamDistributionId = :teamDistributionId', { teamDistributionId: distributionId });
    } else {
      query.where('"tds"."teamDistributionId" = :teamDistributionId', { teamDistributionId: distributionId });
    }

    query.andWhere('"tds"."active" = true').andWhere('"tds"."distributed" = false').orderBy('student.rank', 'ASC');

    const { items: students, meta: paginationMeta } = await paginate(query, { page, limit });
    return { students, paginationMeta };
  }

  public async getStudentWithRelations(studentId: number, relations: FindOptionsRelations<Student>) {
    const student = await this.studentRepository.findOneOrFail({
      where: { id: studentId },
      relations: relations,
    });
    return student;
  }

  public async getStudentsForDistribute(distributionId: number) {
    return this.repository.find({
      where: {
        teamDistributionId: distributionId,
        active: true,
        distributed: false,
      },
      relations: {
        student: true,
      },
      order: {
        student: {
          rank: 'DESC',
        },
      },
    });
  }
}

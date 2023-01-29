import { Student, TeamDistributionStudent } from '@entities/index';
import { TeamDistribution } from '@entities/teamDistribution';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, In, Repository } from 'typeorm';
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

  private verifyStudentTeams(students: Student[], teamDistributionId: number) {
    if (students.find(st => st.teams.find(t => t.teamDistributionId === teamDistributionId))) {
      throw new BadRequestException('One of the students is already on the team for the current distribution');
    }
  }

  private async verifyRegisteredStudents(
    studentIds: number[],
    registeredStudents: TeamDistributionStudent[],
    teamDistributionId: number,
  ) {
    if (registeredStudents.length !== studentIds.length) {
      const notRegisteredStudentIds = studentIds.filter(id => !registeredStudents.find(el => el.studentId === id));
      await this.addStudentsToTeamDistribution(notRegisteredStudentIds, teamDistributionId);
    }
  }

  public async getStudentsForCreateTeamByManager(studentIds: number[], teamDistributionId: number, courseId: number) {
    const students = await this.getStudentsWithTeams(studentIds);
    if (students.length === 0) {
      throw new BadRequestException();
    }
    const teamDistribution = await this.getDistributionById(teamDistributionId);

    this.verifyTeamSize(students, teamDistribution.strictTeamSize);
    this.verifyStudentTeams(students, teamDistributionId);

    const registeredStudents = await this.getTeamDistributionStudents(studentIds, teamDistributionId, courseId);

    await this.verifyRegisteredStudents(studentIds, registeredStudents, teamDistributionId);
    if (registeredStudents.length !== studentIds.length) {
      const notRegisteredStudentIds = studentIds.filter(id => !registeredStudents.find(el => el.studentId === id));
      await this.addStudentsToTeamDistribution(notRegisteredStudentIds, teamDistributionId);
    }
    return students;
  }

  public async getTeamDistributionStudents(studentIds: number[], teamDistributionId: number, courseId: number) {
    return this.repository.find({
      where: { courseId, studentId: In(studentIds), teamDistributionId },
    });
  }

  public async addStudentsToTeamDistribution(studentIds: number[], teamDistributionId: number) {
    await this.repository.save(studentIds.map(id => ({ studentId: id, teamDistributionId })));
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

  public async markStudentsAsDistributed(studentIds: number[], teamDistributionId: number) {
    const records = await this.repository.find({
      where: { studentId: In(studentIds), teamDistributionId },
    });
    this.repository.save(records.map(e => ({ ...e, distributed: true })));
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

  public async getStudentsByTeamDistributionId(distributionId: number, { page = 1, limit = 10 }) {
    const query = this.studentRepository
      .createQueryBuilder('student')
      .leftJoin('student.teamDistributionStudents', 'tds')
      .innerJoin('student.user', 'user')
      .leftJoin('user.resume', 'resume')
      .addSelect('resume.uuid')
      .addSelect(this.getUserFields())
      .where('tds.teamDistributionId = :teamDistributionId', { teamDistributionId: distributionId })
      .andWhere('tds.active = true')
      .andWhere('tds.distributed = false')
      .orderBy('student.rank', 'ASC');
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
}

import { Student } from '@entities/student';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser, Role, CourseRole } from '../../auth';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { TeamDistribution } from '@entities/teamDistribution';
import { Team } from '@entities/team';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    readonly studentRepository: Repository<Student>,
  ) {}

  public getById(id: number) {
    return this.studentRepository.findOneOrFail({ where: { id }, relations: ['user'] });
  }

  public async getStudentsByTeamDistributionId(distributionId: number) {
    const students = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoin('student.teamDistribution', 'td')
      .where('td.id IN (:...id)', { ids: distributionId })
      .innerJoinAndSelect('student.user', 'user')
      .getMany();
    return students;
  }

  public async getStudentWithTeamDistributions(studentId: number) {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['teamDistribution'],
    });
    return student;
  }

  public async getStudentDetailed(studentId: number) {
    const student = await this.studentRepository.findOneOrFail({
      where: { id: studentId },
      relations: ['teams', 'teamDistribution', 'user'],
    });
    return student;
  }

  public async addStudentToTeamDistribution(studentId: number, teamDistribution: TeamDistribution) {
    const student = await this.getStudentDetailed(studentId);
    const currentDate = dayjs();
    const distributionStartDate = dayjs(teamDistribution.startDate);
    const distributionEndDate = dayjs(teamDistribution.endDate);
    if (student == null) throw new NotFoundException();
    if (currentDate < distributionStartDate || currentDate > distributionEndDate) {
      throw new BadRequestException();
    }
    if (student.totalScore < teamDistribution.minTotalScore) {
      throw new BadRequestException('Number of points is less than the input threshold for distribution');
    }
    if (student.teams.find(el => el.teamDistributionId === teamDistribution.id)) {
      throw new BadRequestException();
    }
    student.teamDistribution = [...student.teamDistribution, teamDistribution];
    await this.studentRepository.save(student);
  }

  public async addStudentToTeam(studentId: number, team: Team) {
    const student = await this.getStudentDetailed(studentId);
    student.teams = [...student.teams, team];
    await this.studentRepository.save(student);
  }

  public async deleteStudentFromTeamDistribution(studentId: number, teamDistribution: TeamDistribution) {
    const student = await this.getStudentWithTeamDistributions(studentId);
    if (student == null) throw new NotFoundException();
    student.teamDistribution = student.teamDistribution.filter(el => el.id !== teamDistribution.id);
    await this.studentRepository.save(student);
  }

  public async canAccessStudent(user: AuthUser, studentId: number): Promise<boolean> {
    const student = await this.studentRepository.findOneBy({ id: studentId });
    if (student == null) {
      return false;
    }

    if (user.appRoles?.includes(Role.Admin)) {
      return true;
    }

    const { courseId } = student;
    const courseInfo = user.courses?.[courseId];
    const currentMentorId = user.courses?.[courseId]?.mentorId;

    if (courseInfo?.roles.includes(CourseRole.Manager)) {
      return true;
    }

    if (courseInfo?.roles.includes(CourseRole.Supervisor)) {
      return true;
    }

    if (student.mentorId == null) {
      return false;
    }

    return student.mentorId === currentMentorId;
  }
}

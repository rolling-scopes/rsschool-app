import { Student, TeamDistributionStudent } from '@entities/index';
import { TeamDistribution } from '@entities/teamDistribution';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { Repository } from 'typeorm';
import { TeamService } from './team.service';
import { SaveScoreInput, WriteScoreService } from '../score';

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

    @InjectRepository(TeamDistributionStudent)
    private teamDistributionStudentRepository: Repository<TeamDistributionStudent>,

    private teamService: TeamService,

    private writeScoreService: WriteScoreService,
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

  private async getTeamDistributionStudentsWithScore(teamDistributionId: number, taskId: number) {
    const teamDistributionStudentsWithScore = await this.teamDistributionStudentRepository
      .createQueryBuilder('tds')
      .leftJoinAndSelect('tds.student', 'student')
      .leftJoinAndSelect('student.taskResults', 'tr')
      .where('tds.teamDistributionId = :teamDistributionId', { teamDistributionId })
      .andWhere('tr.courseTaskId = :taskId', { taskId })
      .andWhere('tr.score > 0')
      .getMany();
    return teamDistributionStudentsWithScore;
  }

  public async submitScore(teamDistributionId: number, taskId: number) {
    const allTeams = await this.teamService.findAllByDistributionId(teamDistributionId);
    const studentsWithScore = await this.getTeamDistributionStudentsWithScore(teamDistributionId, taskId);

    const newStudentTaskResults = allTeams.reduce((acc, team) => {
      const studentsIds = team.students.map(el => el.id);
      const studentsWithTaskResultsInTeam = studentsWithScore.filter(el => studentsIds.includes(el.studentId));

      const taskResults = studentsWithTaskResultsInTeam.map(el => el.student.taskResults?.at(0));
      const maxScore = taskResults.length ? Math.max(...taskResults.map(taskResult => taskResult?.score ?? 0)) : 0;
      const taskResultWithMaxScore = taskResults.find(taskResult => taskResult?.score === maxScore);

      const studentsWithoutMaxScore = team.students.filter(student => student.id !== taskResultWithMaxScore?.studentId);

      const newTaskResults = studentsWithoutMaxScore.map(student => {
        return {
          studentId: student.id,
          data: {
            score: taskResultWithMaxScore?.score ?? 0,
            courseTaskId: taskId,
            comment: taskResultWithMaxScore?.comment ?? 'Cross-Check score',
          },
        };
      });
      return acc.concat(newTaskResults);
    }, [] as { data: SaveScoreInput; studentId: number }[]);
    await Promise.all(
      newStudentTaskResults.map(taskResult =>
        this.writeScoreService.saveScore(taskResult.studentId, taskId, taskResult.data),
      ),
    );
  }
}

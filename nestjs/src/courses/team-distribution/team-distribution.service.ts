import { Student, Team, TeamDistributionStudent } from '@entities/index';
import { TeamDistribution } from '@entities/teamDistribution';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { shuffle } from 'lodash';
import { DataSource, Repository } from 'typeorm';
import { TeamDistributionStudentService } from './team-distribution-student.service';
import { TeamService } from './team.service';

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
    private teamDistributionStudentService: TeamDistributionStudentService,
    private teamService: TeamService,
    private dataSource: DataSource,
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

  private getTeamCapacity(teams: Team[], teamSize: number) {
    return teams.reduce((acc, curr) => acc + teamSize - curr.students.length, 0);
  }

  private async removeTeams(smallTeams: Team[], teamDistributionId: number, courseId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const studentIds = smallTeams.flatMap(el => el.students.map(s => s.id));
    try {
      await queryRunner.manager.save(
        Team,
        smallTeams.map(t => ({ ...t, students: [] })),
      );
      await queryRunner.manager.remove(Team, smallTeams);
      const teamDistributionStudents = await this.teamDistributionStudentService.getTeamDistributionStudents(
        studentIds,
        teamDistributionId,
        courseId,
      );
      await queryRunner.manager.save(
        TeamDistributionStudent,
        teamDistributionStudents.map(el => ({ ...el, distributed: false })),
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  private async addStudentsToAvailableTeams(
    teams: Team[],
    students: TeamDistributionStudent[],
    teamsCapacity: number,
    teamSize: number,
  ) {
    let capacity = teamsCapacity;
    const distributedStudents: TeamDistributionStudent[] = [];
    const shuffledStudents = shuffle(students);

    while (capacity > 0 && shuffledStudents.length > 0) {
      const team = teams.find(el => el.students.length < teamSize);
      const teamDistributionStudent = shuffledStudents.pop();
      if (teamDistributionStudent && team) {
        team?.students.push(teamDistributionStudent.student);
        distributedStudents.push(teamDistributionStudent);
      }
      capacity--;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(Team, teams);
      await queryRunner.manager.save(
        TeamDistributionStudent,
        distributedStudents.map(s => ({ ...s, distributed: true })),
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  private async createRandomTeams(
    teamDistributionStudent: TeamDistributionStudent[],
    teamSize: number,
    teamDistributionId: number,
  ) {
    const randomTeamsCount = Math.ceil(teamDistributionStudent.length / teamSize);
    const passwords = await Promise.all(Array(randomTeamsCount).map(_ => this.teamService.generatePassword()));
    const teams: Pick<Team, 'name' | 'students' | 'description' | 'password' | 'teamDistributionId'>[] = Array(
      randomTeamsCount,
    )
      .fill({})
      .map((_, index) => ({
        name: `Random team #${index + 1}`,
        students: [],
        description: 'This team was created by random distribution.',
        password: passwords[index] ?? '123456',
        teamDistributionId: teamDistributionId,
      }));
    teamDistributionStudent.forEach((el, index) => {
      const roundDistribution = Math.floor(index / teamSize) + 1;
      const teamForStudentIndex =
        roundDistribution % 2 === 0 ? -1 * Math.floor(index % teamSize) - 1 : Math.floor(index % teamSize);

      const team = teams.at(teamForStudentIndex);
      team?.students?.push(el.student);
    });
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(Team, teams);
      await queryRunner.manager.save(
        TeamDistributionStudent,
        teamDistributionStudent.map(s => ({ ...s, distributed: true })),
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  public async distributeStudents(teamDistributionId: number) {
    const teamDistribution = await this.getById(teamDistributionId);
    let availableTeams = await this.teamService.getTeamsAvailableForDistribute(
      teamDistributionId,
      teamDistribution.strictTeamSize,
    );
    let studentsWithoutTeam = await this.teamDistributionStudentService.getStudentsForDistribute(teamDistributionId);
    const smallTeams = availableTeams.filter(t => t.students.length <= 1);
    let teamsCapacity = this.getTeamCapacity(availableTeams, teamDistribution.strictTeamSize);

    if (smallTeams.length && teamsCapacity > studentsWithoutTeam.length) {
      await this.removeTeams(smallTeams, teamDistributionId, teamDistribution.courseId);
      availableTeams = await this.teamService.getTeamsAvailableForDistribute(
        teamDistributionId,
        teamDistribution.strictTeamSize,
      );
      studentsWithoutTeam = await this.teamDistributionStudentService.getStudentsForDistribute(teamDistributionId);
      teamsCapacity = this.getTeamCapacity(availableTeams, teamDistribution.strictTeamSize);
    }

    if (teamsCapacity !== 0) {
      await this.addStudentsToAvailableTeams(
        availableTeams,
        studentsWithoutTeam,
        teamsCapacity,
        teamDistribution.strictTeamSize,
      );
      studentsWithoutTeam = await this.teamDistributionStudentService.getStudentsForDistribute(teamDistributionId);
    }
    if (studentsWithoutTeam.length) {
      await this.createRandomTeams(studentsWithoutTeam, teamDistribution.strictTeamSize, teamDistributionId);
    }
  }
}

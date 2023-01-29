import { Student, Team, TeamDistributionStudent } from '@entities/index';
import { TeamDistribution } from '@entities/teamDistribution';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { shuffle } from 'lodash';
import { DataSource, Repository } from 'typeorm';
import { TeamDistributionStudentService } from './team-distribution-student.service';
import { TeamService } from './team.service';

@Injectable()
export class DistributeStudentsService {
  constructor(
    @InjectRepository(TeamDistribution)
    private repository: Repository<TeamDistribution>,
    private teamDistributionStudentService: TeamDistributionStudentService,
    private teamService: TeamService,
    private dataSource: DataSource,
  ) {}

  public getById(id: number) {
    return this.repository.findOneOrFail({ where: { id } });
  }

  private getTeamCapacity(teams: Team[], teamSize: number) {
    return teams.reduce((acc, curr) => acc + teamSize - curr.students.length, 0);
  }

  private async modifyTeams(
    teams: Partial<Team>[],
    teamDistributionStudents: TeamDistributionStudent[],
    removeTeams = false,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await Promise.all([
        queryRunner.manager.save(Team, teams),
        queryRunner.manager.save(TeamDistributionStudent, teamDistributionStudents),
      ]);
      if (removeTeams) {
        await queryRunner.manager.remove(Team, teams);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  private async removeTeams(teams: Team[], teamDistributionId: number, courseId: number) {
    const studentIds = teams.flatMap(el => el.students.map(s => s.id));
    const teamDistributionStudents = await this.teamDistributionStudentService.getTeamDistributionStudents(
      studentIds,
      teamDistributionId,
      courseId,
    );
    await this.modifyTeams(
      teams.map(t => ({ ...t, students: [] })),
      teamDistributionStudents.map(el => ({ ...el, distributed: false })),
      true,
    );
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
    await this.modifyTeams(
      teams,
      distributedStudents.map(el => ({ ...el, distributed: true })),
    );
  }

  private async createInitialTeams(studentsCount: number, teamSize: number, teamDistributionId: number) {
    const randomTeamsCount = Math.ceil(studentsCount / teamSize);
    const teams: Pick<Team, 'name' | 'students' | 'description' | 'password' | 'teamDistributionId'>[] =
      await Promise.all(
        Array(randomTeamsCount)
          .fill({})
          .map(async (_, index) => {
            const password = await this.teamService.generatePassword();
            return {
              name: `Random team #${index + 1}`,
              students: [],
              description: 'This team was created by random distribution.',
              password,
              teamDistributionId,
            };
          }),
      );
    return teams;
  }

  private async createRandomTeams(
    teamDistributionStudents: TeamDistributionStudent[],
    teamSize: number,
    teamDistributionId: number,
  ) {
    const teams = await this.createInitialTeams(teamDistributionStudents.length, teamSize, teamDistributionId);

    // Assign students to teams
    const countDistributionRounds = Math.ceil(teamDistributionStudents.length / teamSize);

    if (countDistributionRounds >= teamSize) {
      for (let draftPosition = 1; draftPosition <= teams.length; draftPosition++) {
        const students: Student[] = [];

        for (let round = 1; round <= countDistributionRounds; round++) {
          let draftPick;

          if (round % 2 === 0) {
            draftPick = round * teams.length - draftPosition + 1;
          } else {
            draftPick = (round - 1) * teams.length + draftPosition;
          }
          if (teamDistributionStudents.at(draftPick - 1)) {
            students.push(teamDistributionStudents.at(draftPick - 1)!.student);
          }
        }
        teams.at(draftPosition - 1)?.students.push(...students);
      }
    } else {
      const shuffledStudents = shuffle(teamDistributionStudents);
      while (shuffledStudents.length > 0) {
        const team = teams.find(el => el.students.length < teamSize);
        const teamDistributionStudent = shuffledStudents.pop();
        if (teamDistributionStudent && team) {
          team?.students.push(teamDistributionStudent.student);
        }
      }
    }

    // Save teams and teamDistributionStudent
    await this.modifyTeams(
      teams.map(t => ({ ...t, teamLeadId: t.students.sort((a, b) => a.rank - b.rank).at(0)?.id })),
      teamDistributionStudents.map(s => ({ ...s, distributed: true })),
    );
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

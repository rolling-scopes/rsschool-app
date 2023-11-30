import { Controller, Post, Body, UseGuards, ParseIntPipe, Param, Get, Delete, Put, Req, Query } from '@nestjs/common';
import { TeamDistributionService } from './team-distribution.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseGuard, CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import {
  TeamDistributionDetailedDto,
  TeamDistributionDto,
  TeamDistributionStudentDto,
  UpdateTeamDistributionDto,
  CreateTeamDistributionDto,
  StudentsWithoutTeamDto,
  TeamDto,
} from './dto';
import { TeamService } from './team.service';
import { RegisteredStudentOrPowerUserGuard } from './registered-student-guard';
import { TeamDistributionStudentService } from './team-distribution-student.service';
import { Student } from '@entities/index';
import { DistributeStudentsService } from './distribute-students.service';
import { StudentId } from '../../core/decorators/';

@Controller('courses/:courseId/team-distribution')
@ApiTags('team distribution')
@UseGuards(DefaultGuard, CourseGuard)
export class TeamDistributionController {
  constructor(
    private readonly teamDistributionService: TeamDistributionService,
    private readonly teamService: TeamService,
    private readonly teamDistributionStudentService: TeamDistributionStudentService,
    private readonly distributeStudentsService: DistributeStudentsService,
  ) {}
  @Post('/')
  @UseGuards(RoleGuard)
  @ApiOkResponse({ type: TeamDistributionDto })
  @ApiOperation({ operationId: 'createTeamDistribution' })
  @RequiredRoles([CourseRole.Manager, Role.Admin], true)
  public async create(@Param('courseId', ParseIntPipe) courseId: number, @Body() dto: CreateTeamDistributionDto) {
    const data = await this.teamDistributionService.create({ courseId, ...dto });
    return new TeamDistributionDto(data);
  }

  @Get('/')
  @ApiOkResponse({ type: [TeamDistributionDto] })
  @ApiOperation({ operationId: 'getCourseTeamDistributions' })
  public async getCourseTeamDistributions(
    @StudentId() studentId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    const data = await this.teamDistributionService.findByCourseId(courseId);
    let student: Student | null = null;

    if (studentId) {
      student = await this.teamDistributionStudentService.getStudentWithRelations(studentId, {
        user: true,
        teams: true,
        teamDistributionStudents: {
          teamDistribution: true,
        },
      });
    }

    const teamDistributionsWithStatus = data.map(td =>
      this.teamDistributionService.addStatusToDistribution(td, student),
    );

    return teamDistributionsWithStatus.map(el => new TeamDistributionDto(el));
  }

  @Delete('/:id')
  @UseGuards(RoleGuard)
  @ApiOkResponse()
  @RequiredRoles([Role.Admin, CourseRole.Manager], true)
  @ApiOperation({ operationId: 'deleteTeamDistribution' })
  public async delete(@Param('courseId', ParseIntPipe) _: number, @Param('id', ParseIntPipe) id: number) {
    return this.teamDistributionService.remove(id);
  }

  @Put('/:id')
  @UseGuards(RoleGuard)
  @RequiredRoles([Role.Admin, CourseRole.Manager], true)
  @ApiOkResponse()
  @ApiOperation({ operationId: 'updateTeamDistribution' })
  public async update(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTeamDistributionDto,
  ) {
    await this.teamDistributionService.update(id, {
      courseId,
      id: id,
      ...dto,
    });
  }

  @Post('/:id/registry')
  @UseGuards(RoleGuard)
  @ApiOkResponse({ type: TeamDistributionDto })
  @ApiOperation({ operationId: 'teamDistributionRegistry' })
  @RequiredRoles([CourseRole.Student])
  public async registry(
    @StudentId() studentId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const teamDistribution = await this.teamDistributionService.getById(id);

    if (studentId) {
      await this.teamDistributionStudentService.addStudentToTeamDistribution(studentId, teamDistribution, courseId);
    }
  }

  @Get('/:id/submit-score/:taskId')
  @UseGuards(RoleGuard)
  @ApiOkResponse({ type: TeamDistributionDto })
  @ApiOperation({ operationId: 'submitScore' })
  @RequiredRoles([CourseRole.Manager], true)
  public async submitScore(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('id', ParseIntPipe) id: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    await this.teamDistributionService.submitScore(id, taskId);
  }

  @Delete('/:id/registry')
  @UseGuards(RoleGuard)
  @ApiOkResponse()
  @ApiOperation({ operationId: 'teamDistributionDeleteRegistry' })
  @RequiredRoles([CourseRole.Student])
  public async deleteRegistry(
    @StudentId() studentId: number,
    @Param('courseId', ParseIntPipe) _: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (studentId) {
      await this.teamDistributionStudentService.deleteStudentFromTeamDistribution(studentId, id);
    }
  }

  @Get('/:id/detailed')
  @UseGuards(RoleGuard, RegisteredStudentOrPowerUserGuard)
  @ApiOkResponse({ type: TeamDistributionDetailedDto })
  @ApiOperation({ operationId: 'getCourseTeamDistributionDetailed' })
  @RequiredRoles([CourseRole.Student, CourseRole.Manager, CourseRole.Dementor, Role.Admin], true)
  public async getCourseTeamDistributionDetailed(
    @StudentId() studentId: number,
    @Param('courseId', ParseIntPipe) _: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    let team;

    if (studentId) {
      const student = await this.teamDistributionStudentService.getStudentWithRelations(studentId, {
        teams: true,
        user: true,
      });
      const data = student.teams.find(t => t.teamDistributionId === id);
      if (data) {
        team = await this.teamService.findTeamWithStudentsById(data.id);
        team = new TeamDto(team);
      }
    }
    const { teamDistribution, teamsCount, studentsWithoutTeamCount } =
      await this.teamDistributionService.getDistributionDetailedById(id);
    return new TeamDistributionDetailedDto(teamDistribution, teamsCount, studentsWithoutTeamCount, team);
  }

  @Get('/:id/students')
  @UseGuards(RoleGuard, RegisteredStudentOrPowerUserGuard)
  @ApiOkResponse({ type: [TeamDistributionStudentDto] })
  @ApiOperation({ operationId: 'getStudentsWithoutTeam' })
  @RequiredRoles([CourseRole.Student, CourseRole.Manager, CourseRole.Dementor, Role.Admin], true)
  public async getStudentsWithoutTeam(
    @Param('courseId', ParseIntPipe) _: number,
    @Param('id', ParseIntPipe) id: number,
    @Query('pageSize', ParseIntPipe) pageSize: number = 10,
    @Query('current', ParseIntPipe) current: number = 1,
    @Query('search') search: string,
  ) {
    const { students, paginationMeta } = await this.teamDistributionStudentService.getStudentsByTeamDistributionId(id, {
      page: current,
      limit: pageSize,
      search,
    });

    return new StudentsWithoutTeamDto(students, paginationMeta);
  }

  @Post('/:id/distribution')
  @UseGuards(RoleGuard)
  @ApiOkResponse()
  @ApiOperation({ operationId: 'distributeStudentsToTeam' })
  @RequiredRoles([CourseRole.Manager, Role.Admin], true)
  public async distributeStudentsToTeam(
    @Param('courseId', ParseIntPipe) _: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.distributeStudentsService.distributeStudents(id);
  }
}

import { Student } from '@entities/index';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseGuard, CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { TeamDto, TeamPasswordDto, TeamsDto, CreateTeamDto, TeamInfoDto, UpdateTeamDto, JoinTeamDto } from './dto/';
import { TeamDistributionStudentService } from './team-distribution-student.service';
import { TeamLeadOrCourseManagerGuard } from './team-lead-or-manager.guard';
import { TeamService } from './team.service';

@Controller('courses/:courseId/team-distribution/:distributionId/team')
@ApiTags('team')
@UseGuards(DefaultGuard, CourseGuard)
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly teamDistributionStudentService: TeamDistributionStudentService,
  ) {}

  @Get('/')
  @UseGuards(RoleGuard)
  @ApiOkResponse({ type: TeamsDto })
  @ApiOperation({ operationId: 'getTeams' })
  @RequiredRoles([CourseRole.Student, Role.Admin, CourseRole.Manager])
  public async getTeams(
    @Param('courseId', ParseIntPipe) _: number,
    @Param('distributionId', ParseIntPipe) distributionId: number,
    @Query('pageSize') pageSize: number = 10,
    @Query('current') current: number = 1,
  ) {
    const { teams, paginationMeta } = await this.teamService.findByDistributionId(distributionId, {
      page: current,
      limit: pageSize,
    });

    return new TeamsDto(teams, paginationMeta);
  }

  @Post('/')
  @UseGuards(RoleGuard)
  @ApiOkResponse({ type: TeamDto })
  @ApiOperation({ operationId: 'createTeam' })
  @RequiredRoles([CourseRole.Student, Role.Admin, CourseRole.Manager])
  public async create(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('distributionId', ParseIntPipe) distributionId: number,
    @Body() dto: CreateTeamDto,
  ) {
    const studentId = req.user.courses[courseId]?.studentId;
    let students: Student[] = [];
    const isManager = req.user.isAdmin || req.user.courses[courseId]?.roles.includes(CourseRole.Manager);
    if (studentId && !isManager) {
      const record = await this.teamDistributionStudentService.getTeamDistributionStudent(
        studentId,
        distributionId,
        true,
      );
      if (record?.distributed) {
        throw new BadRequestException();
      }
      students.push(record.student);
    }

    if (isManager) {
      students = await this.teamDistributionStudentService.getStudentsForCreateTeamByManager(
        dto.studentIds ?? [],
        distributionId,
        courseId,
      );
    }

    const data = await this.teamService.create({
      teamDistributionId: distributionId,
      students,
      ...dto,
    });
    const team = await this.teamService.findTeamWithStudentsById(data.id);

    if (team.students.length) {
      await this.teamDistributionStudentService.markStudentsAsDistributed(
        team.students.map(s => s.id),
        distributionId,
      );
    }

    return new TeamDto(team);
  }

  @Patch('/:id')
  @UseGuards(RoleGuard, TeamLeadOrCourseManagerGuard)
  @RequiredRoles([Role.Admin, CourseRole.Manager, CourseRole.Student])
  @ApiOperation({ operationId: 'updateTeam' })
  @ApiOkResponse()
  public async updateTeam(
    @Param('courseId', ParseIntPipe) _: number,
    @Param('distributionId', ParseIntPipe) _distributionId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTeamDto,
  ) {
    await this.teamService.update(id, dto);
  }

  @Get('/:id/password')
  @UseGuards(RoleGuard)
  @ApiOkResponse({ type: TeamPasswordDto })
  @ApiOperation({ operationId: 'getTeamPassword' })
  @RequiredRoles([CourseRole.Student, Role.Admin, CourseRole.Manager])
  public async getTeamPassword(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('distributionId', ParseIntPipe) _: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const team = await this.teamService.findById(id);
    const studentId = req.user.courses[courseId]?.studentId;
    const isManager = req.user.isAdmin || req.user.courses[courseId]?.roles.includes(CourseRole.Manager);

    if (studentId !== team.teamLeadId && !isManager) throw new BadRequestException();
    return new TeamPasswordDto(team);
  }

  @Post('/:id/join')
  @UseGuards(RoleGuard)
  @ApiOkResponse({ type: TeamInfoDto })
  @ApiOperation({ operationId: 'joinTeam' })
  @RequiredRoles([CourseRole.Student])
  public async joinTeam(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('distributionId', ParseIntPipe) teamDistributionId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: JoinTeamDto,
  ) {
    const studentId = req.user.courses[courseId]?.studentId;
    if (!studentId) throw new BadRequestException();
    const team = await this.teamService.findById(id);
    if (dto.password !== team.password) throw new BadRequestException('Invalid password');
    if (team.teamDistribution.strictTeamSizeMode && team.teamDistribution.strictTeamSize <= team.students.length) {
      throw new BadRequestException();
    }
    const teamDistributionStudent = await this.teamDistributionStudentService.getTeamDistributionStudent(
      studentId,
      teamDistributionId,
      true,
    );
    if (teamDistributionStudent.distributed || !teamDistributionStudent.active) {
      throw new BadRequestException();
    }
    await this.teamService.addStudentToTeam(team, teamDistributionStudent.student);
    await this.teamDistributionStudentService.markStudentAsDistributed(studentId, teamDistributionId);
    return new TeamInfoDto(team);
  }

  @Post('/:id/leave')
  @UseGuards(RoleGuard)
  @ApiOkResponse()
  @ApiOperation({ operationId: 'leaveTeam' })
  @RequiredRoles([CourseRole.Student])
  public async leaveTeam(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('distributionId', ParseIntPipe) teamDistributionId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const studentId = req.user.courses[courseId]?.studentId;
    if (!studentId) throw new BadRequestException();
    await this.teamService.deleteStudentFromTeam(id, studentId);
    const studentsCount = await this.teamService.getStudentsCountInTeam(id);
    if (studentsCount === 0) {
      await this.teamService.remove(id);
    }
    await this.teamDistributionStudentService.markStudentAsNotDistributed(studentId, teamDistributionId);
  }
}

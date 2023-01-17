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
import { StudentsService } from '../students';
import { TeamDto, TeamPasswordDto, TeamsDto, JoinTeamDto, CreateTeamDto, TeamsQueryDto, UpdateTeamDto } from './dto/';
import { TeamDistributionService } from './team-distribution.service';
import { TeamService } from './team.service';

@Controller('courses/:courseId/team-distribution/:distributionId/team')
@ApiTags('team')
@UseGuards(DefaultGuard, CourseGuard)
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly studentService: StudentsService,
    private readonly distributionService: TeamDistributionService,
  ) {}

  @Get('/')
  @UseGuards(RoleGuard)
  @ApiOkResponse({ type: TeamsDto })
  @ApiOperation({ operationId: 'getTeams' })
  @RequiredRoles([CourseRole.Student, Role.Admin, CourseRole.Manager])
  public async getTeams(
    @Param('courseId', ParseIntPipe) _: number,
    @Param('distributionId', ParseIntPipe) distributionId: number,
    @Query() query: TeamsQueryDto,
  ) {
    const page = parseInt(query.current);
    const limit = parseInt(query.pageSize);
    const { teams, paginationMeta } = await this.teamService.findByDistributionId(distributionId, {
      page,
      limit,
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
    const students: Student[] = [];
    const isManager = req.user.isAdmin || req.user.courses[courseId]?.roles.includes(CourseRole.Manager);

    if (studentId && !isManager) {
      const student = await this.studentService.getStudentDetailed(studentId);
      if (student.teams.find(t => t.teamDistributionId === distributionId)) {
        throw new BadRequestException();
      }
      students.push(student);
    }
    const data = await this.teamService.create({
      teamDistributionId: distributionId,
      students,
      ...dto,
    });
    const team = await this.teamService.findByIdDetailed(data.id);

    if (team.students.length) {
      const distribution = await this.distributionService.getById(distributionId);
      await Promise.all(
        team.students.map(el => this.studentService.deleteStudentFromTeamDistribution(el.id, distribution)),
      );
    }

    return new TeamDto(team);
  }

  @Patch('/:id')
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
  @ApiOkResponse({ type: TeamDto })
  @ApiOperation({ operationId: 'joinTeam' })
  @RequiredRoles([CourseRole.Student])
  public async joinTeam(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('distributionId', ParseIntPipe) distributionId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: JoinTeamDto,
  ) {
    const studentId = req.user.courses[courseId]?.studentId;
    if (!studentId) throw new BadRequestException();
    const team = await this.teamService.findById(id);
    const student = await this.studentService.getStudentDetailed(studentId);
    if (team.teamDistribution.strictStudentsCount && team.teamDistribution.studentsCount <= team.students.length + 1) {
      throw new BadRequestException();
    }
    if (student.teams.find(t => t.teamDistributionId === team.teamDistributionId)) throw new BadRequestException();
    if (!student.teamDistribution.find(td => td.id === distributionId)) throw new BadRequestException();
    if (dto.password !== team.password) throw new BadRequestException('Invalid password');
    await this.studentService.addStudentToTeam(studentId, team);
    await this.studentService.deleteStudentFromTeamDistribution(studentId, team.teamDistribution);
    return new TeamDto(team);
  }

  @Post('/:id/leave')
  @UseGuards(RoleGuard)
  @ApiOkResponse()
  @ApiOperation({ operationId: 'leaveTeam' })
  @RequiredRoles([CourseRole.Student])
  public async leaveTeam(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('distributionId', ParseIntPipe) distributionId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const studentId = req.user.courses[courseId]?.studentId;
    if (!studentId) throw new BadRequestException();
    await this.studentService.deleteStudentFromTeam(studentId, id);
    const teamDistribution = await this.distributionService.getById(distributionId);
    await this.studentService.addStudentToTeamDistribution(studentId, teamDistribution, false);
    const studentsCount = await this.teamService.getStudentsCountInTeam(id);
    if (studentsCount === 0) await this.teamService.remove(id);
  }
}

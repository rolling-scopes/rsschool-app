import { Student } from '@entities/index';
import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseGuard, CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { StudentsService } from '../students';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamDto, TeamPasswordDto } from './dto/team.dto';
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
    if (data.students.length) {
      const distribution = await this.distributionService.getById(distributionId);
      await Promise.all(
        data.students.map(el => this.studentService.deleteStudentFromTeamDistribution(el.id, distribution)),
      );
    }
    return new TeamDto(data);
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
}

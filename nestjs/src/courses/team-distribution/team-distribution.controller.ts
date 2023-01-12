import {
  Controller,
  Post,
  Body,
  UseGuards,
  ParseIntPipe,
  Param,
  Get,
  Delete,
  Put,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { TeamDistributionService } from './team-distribution.service';
import { CreateTeamDistributionDto } from './dto/create-team-distribution.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseGuard, CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { TeamDistributionDetailedDto, TeamDistributionDto, UpdateTeamDistributionDto } from './dto';
import { StudentsService } from '../students';
import { Student } from '@entities/index';

@Controller('courses/:courseId/team-distribution')
@ApiTags('team distribution')
@UseGuards(DefaultGuard, CourseGuard)
export class TeamDistributionController {
  constructor(
    private readonly teamDistributionService: TeamDistributionService,
    private readonly studentsService: StudentsService,
  ) {}
  @Post('/')
  @UseGuards(RoleGuard)
  @ApiOkResponse({ type: TeamDistributionDto })
  @ApiOperation({ operationId: 'createTeamDistribution' })
  @RequiredRoles([CourseRole.Manager, Role.Admin])
  public async create(@Param('courseId', ParseIntPipe) courseId: number, @Body() dto: CreateTeamDistributionDto) {
    const data = await this.teamDistributionService.create({ courseId, ...dto });
    return new TeamDistributionDto(data);
  }

  @Get('/')
  @ApiOkResponse({ type: [TeamDistributionDto] })
  @ApiOperation({ operationId: 'getCourseTeamDistributions' })
  public async getCourseTeamDistributions(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    const studentId = req.user.courses[courseId]?.studentId;
    let student: Student | null = null;
    if (studentId) {
      student = await this.studentsService.getStudentDetailed(studentId);
    }
    const data = await this.teamDistributionService.findByCourseId(courseId, student);
    return data.map(el => new TeamDistributionDto(el));
  }

  @Delete('/:id')
  @UseGuards(RoleGuard)
  @ApiOkResponse()
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  @ApiOperation({ operationId: 'deleteTeamDistribution' })
  public async delete(@Param('courseId', ParseIntPipe) _: number, @Param('id', ParseIntPipe) id: number) {
    return this.teamDistributionService.remove(id);
  }

  @Put('/:id')
  @UseGuards(RoleGuard)
  @RequiredRoles([Role.Admin, CourseRole.Manager])
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
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const teamDistribution = await this.teamDistributionService.getById(id);
    const studentId = req.user.courses[courseId]?.studentId;
    if (studentId) {
      await this.studentsService.addStudentToTeamDistribution(studentId, teamDistribution);
    }
  }

  @Delete('/:id/registry')
  @UseGuards(RoleGuard)
  @ApiOkResponse({ type: TeamDistributionDto })
  @ApiOperation({ operationId: 'teamDistributionDeleteRegistry' })
  @RequiredRoles([CourseRole.Student])
  public async deleteRegistry(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const teamDistribution = await this.teamDistributionService.getById(id);
    const studentId = req.user.courses[courseId]?.studentId;
    if (studentId) {
      await this.studentsService.deleteStudentFromTeamDistribution(studentId, teamDistribution);
    }
  }

  @Get('/:id/detailed')
  @UseGuards(RoleGuard)
  @ApiOkResponse({ type: TeamDistributionDetailedDto })
  @ApiOperation({ operationId: 'getCourseTeamDistributionDetailed' })
  @RequiredRoles([CourseRole.Student, CourseRole.Manager, Role.Admin])
  public async getCourseTeamDistributionDetailed(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const studentId = req.user.courses[courseId]?.studentId;
    const isManager = req.user.isAdmin || req.user.courses[courseId]?.roles.includes(CourseRole.Manager);
    let team;
    if (studentId) {
      const student = await this.studentsService.getStudentDetailed(studentId);
      if (
        !student.teamDistribution.find(d => d.id === id) &&
        !student.teams.find(t => t.teamDistributionId === id) &&
        !isManager
      ) {
        throw new ForbiddenException();
      }
      team = student.teams.find(t => t.teamDistributionId === id);
    }
    const distribution = await this.teamDistributionService.getDistributionDetailedById(id);
    return new TeamDistributionDetailedDto(distribution, team);
  }
}

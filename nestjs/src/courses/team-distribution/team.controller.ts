import { Student } from '@entities/index';
import { Body, Controller, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseGuard, CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, RoleGuard } from 'src/auth';
import { StudentsService } from '../students';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamDto } from './dto/team.dto';
import { TeamDistributionService } from './team-distribution.service';
import { TeamService } from './team.service';

@Controller('courses/:courseId/team-distribution/:distributionId/team')
@ApiTags('team')
@UseGuards(DefaultGuard, CourseGuard)
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly teamDistributionService: TeamDistributionService,
    private readonly studentService: StudentsService,
  ) {}

  @Post('/')
  @UseGuards(RoleGuard)
  @ApiOkResponse({ type: TeamDto })
  @ApiOperation({ operationId: 'createTeam' })
  @RequiredRoles([CourseRole.Student])
  public async create(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('distributionId', ParseIntPipe) distributionId: number,
    @Body() dto: CreateTeamDto,
  ) {
    const teamDistribution = await this.teamDistributionService.getById(distributionId);
    const studentId = req.user.courses[courseId]?.studentId;
    const students: Student[] = [];
    if (studentId) {
      const student = await this.studentService.getById(studentId);
      students.push(student);
    }
    const data = await this.teamService.create({ teamDistribution, students, ...dto });
    return new TeamDto(data);
  }
}

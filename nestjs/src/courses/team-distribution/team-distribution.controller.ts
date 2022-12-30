import { Controller, Post, Body, UseGuards, ParseIntPipe, Param, Get, Delete, Put } from '@nestjs/common';
import { TeamDistributionService } from './team-distribution.service';
import { CreateTeamDistributionDto } from './dto/create-team-distribution.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseGuard, CourseRole, DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { TeamDistributionDto, UpdateTeamDistributionDto } from './dto';

@Controller('courses/:courseId/team-distribution')
@ApiTags('team distribution')
@UseGuards(DefaultGuard, CourseGuard)
export class TeamDistributionController {
  constructor(private readonly teamDistributionService: TeamDistributionService) {}
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
  public async getCourseTeamDistributions(@Param('courseId', ParseIntPipe) courseId: number) {
    const data = await this.teamDistributionService.findByCourseId(courseId);
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
}

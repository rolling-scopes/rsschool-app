import { Controller, Post, Body, UseGuards, ParseIntPipe, Param } from '@nestjs/common';
import { TeamDistributionService } from './team-distribution.service';
import { CreateTeamDistributionDto } from './dto/create-team-distribution.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseGuard, CourseRole, DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { TeamDistributionDto } from './dto';

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

  // @Get()
  // findAll() {
  //   return this.teamDistributionService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.teamDistributionService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTeamDistributionDto: UpdateTeamDistributionDto) {
  //   return this.teamDistributionService.update(+id, updateTeamDistributionDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.teamDistributionService.remove(+id);
  // }
}

import { Body, Controller, Delete, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { uniq } from 'lodash';
import { CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { ApproveMentorDto } from './dto/approve-mentor.dto';
import { MentorRegistryDto } from './dto/mentor-registry.dto';
import { RegistryService } from './registry.service';
import { CoursesService } from 'src/courses/courses.service';
import { DisciplinesService } from 'src/disciplines/disciplines.service';

@Controller('registry')
@ApiTags('registry')
@UseGuards(DefaultGuard, RoleGuard)
export class RegistryController {
  constructor(
    private registryService: RegistryService,
    private notificationService: UserNotificationsService,
    private coursesService: CoursesService,
    private disciplinesService: DisciplinesService,
  ) {}

  @Put('mentor/:githubId')
  @ApiOperation({ operationId: 'approveMentor' })
  @RequiredRoles([Role.Admin, CourseRole.Manager, CourseRole.Supervisor])
  @ApiOkResponse()
  public async approveMentor(@Param('githubId') githubId: string, @Body() body: ApproveMentorDto) {
    const { preselectedCourses } = body;

    const [user, notificationData] = await Promise.all([
      this.registryService.approveMentor(githubId, preselectedCourses),
      this.registryService.buildMentorApprovalData(preselectedCourses),
    ]);

    await this.notificationService.sendEventNotification({
      data: notificationData,
      notificationId: 'mentorRegistrationApproval',
      userId: user.id,
    });
  }

  @Delete('mentor/:githubId')
  @ApiOperation({ operationId: 'cancelMentorRegistry' })
  @RequiredRoles([Role.Admin, CourseRole.Manager, CourseRole.Supervisor])
  @ApiOkResponse()
  public async cancelMentorRegistry(@Param('githubId') githubId: string) {
    await this.registryService.cancelMentorRegistry(githubId);
  }

  @Get('mentors')
  @ApiOperation({ operationId: 'getMentorRegistries' })
  @RequiredRoles([Role.Admin, CourseRole.Manager, CourseRole.Supervisor])
  @ApiOkResponse({ type: [MentorRegistryDto] })
  public async getMentorRegistries(@Req() req: CurrentRequest) {
    if (req.user.isAdmin) {
      const data = await this.registryService.findAllMentorRegistries();
      return data.map(el => new MentorRegistryDto(el));
    } else {
      const coursesIds = Object.entries(req.user.courses)
        .filter(([_, value]) => value.roles.includes(CourseRole.Manager) || value.roles.includes(CourseRole.Supervisor))
        .map(([key]) => Number(key));
      const courses = await this.coursesService.getByIds(coursesIds);
      const disciplineIds = uniq(courses.map(course => course.disciplineId).filter(Boolean)) as number[];
      const disciplines = await this.disciplinesService.getByIds(disciplineIds);
      const disciplineNames = disciplines.map(discipline => discipline.name);
      const data = await this.registryService.findMentorRegistriesByCourseIdsAndDisciplines(
        coursesIds,
        disciplineNames,
      );
      return data.map(el => new MentorRegistryDto(el));
    }
  }
}

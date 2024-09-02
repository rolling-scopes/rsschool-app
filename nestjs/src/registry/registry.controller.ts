import { Body, Controller, Delete, Get, Param, Put, Req, UseGuards, Query, ParseArrayPipe, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { uniq } from 'lodash';
import { CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { ApproveMentorDto } from './dto/approve-mentor.dto';
import { MentorRegistryDto } from './dto/mentor-registry.dto';
import { RegistryService } from './registry.service';
import { CoursesService } from 'src/courses/courses.service';
import { DisciplinesService } from 'src/disciplines/disciplines.service';
import { CommentMentorRegistryDto } from './dto/comment-mentor-registry.dto';
import { FilterMentorRegistryResponse } from './dto/mentor-registry.dto';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from './constants';
import { CourseInfo } from '@entities/session';
import { InviteMentorsDto } from './dto/invite-mentors.dto';

export enum MentorRegistryTabsMode {
  New = 'new',
  All = 'all',
}


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

  @Put('mentor/:githubId/comment')
  @ApiOperation({ operationId: 'commentMentorRegistry' })
  @RequiredRoles([Role.Admin, CourseRole.Manager, CourseRole.Supervisor])
  @ApiOkResponse()
  public async commentMentorRegistry(@Param('githubId') githubId: string, @Body() body: CommentMentorRegistryDto) {
    const { comment } = body;
    await this.registryService.commentMentorRegistry(githubId, comment);
  }

  @Get('mentors')
  @ApiOperation({ operationId: 'getMentorRegistries' })
  @RequiredRoles([Role.Admin, CourseRole.Manager, CourseRole.Supervisor])
  @ApiOkResponse({ type: FilterMentorRegistryResponse })
  @ApiQuery({ name: 'status', required: false, enum: MentorRegistryTabsMode })
  @ApiQuery({ name: 'pageSize', required: false, type: 'number' })
  @ApiQuery({ name: 'currentPage', required: false, type: 'number' })
  @ApiQuery({ name: 'githubId', required: false, type: 'string' })
  @ApiQuery({ name: 'cityName', required: false, type: 'string' })
  @ApiQuery({ name: 'preferedCourses', required: false, type: 'number', isArray: true })
  @ApiQuery({ name: 'preselectedCourses', required: false, type: 'number', isArray: true })
  @ApiQuery({ name: 'technicalMentoring', required: false, type: 'string', isArray: true })
  public async getMentorRegistries(
    @Req() req: CurrentRequest,
    @Query('status') status: MentorRegistryTabsMode = MentorRegistryTabsMode.All,
    @Query('pageSize') pageSize?: number,
    @Query('currentPage') currentPage?: number,
    @Query('githubId') githubId?: string,
    @Query('cityName') cityName?: string,
    @Query('preferedCourses', new ParseArrayPipe({ items: Number, optional: true })) preferedCourses?: number[],
    @Query('preselectedCourses', new ParseArrayPipe({ items: Number, optional: true })) preselectedCourses?: number[],
    @Query('technicalMentoring', new ParseArrayPipe({ items: String, optional: true })) technicalMentoring?: string[],
  ) {
    if (req.user.isAdmin && !req.query) {
      const data = await this.registryService.findAllMentorRegistries();
      return {
        total: data.length,
        mentors: data.map(el => new MentorRegistryDto(el)),
      };
    } else {
      const data = await this.registryService.filterMentorRegistries({
        page: currentPage || DEFAULT_PAGE_NUMBER,
        limit: pageSize || DEFAULT_PAGE_SIZE,
        githubId,
        cityName,
        preferedCourses,
        preselectedCourses,
        technicalMentoring,
        coursesIds: req.user.isAdmin
          ? undefined
          : Object.entries(req.user.courses)
              .filter(
                ([_, value]) => value.roles.includes(CourseRole.Manager) || value.roles.includes(CourseRole.Supervisor),
              )
              .map(([key]) => Number(key)),
        disciplineNames: req.user.isAdmin ? undefined : await this.getDisciplineNamesByCourseIds(req.user.courses),
        status
      });
      return {
        total: data.total,
        mentors: data.mentors.map(el => new MentorRegistryDto(el)),
      };
    }
  }

  private async getDisciplineNamesByCourseIds(userCourses: Record<number, CourseInfo>): Promise<string[]> {
    const coursesIds = Object.entries(userCourses)
      .filter(([_, value]) => value.roles.includes(CourseRole.Manager) || value.roles.includes(CourseRole.Supervisor))
      .map(([key]) => Number(key));
    const courses = await this.coursesService.getByIds(coursesIds);
    const disciplineIds = uniq(courses.map(course => course.disciplineId).filter(Boolean)) as number[];
    const disciplines = await this.disciplinesService.getByIds(disciplineIds);
    return disciplines.map(discipline => discipline.name);
  }

  @Post('mentors/invite')
  @ApiOperation({ operationId: 'inviteMentors' })
  @RequiredRoles([Role.Admin])
  public async inviteMentors(@Body() body: InviteMentorsDto) {
    await this.registryService.sendInvitationsToMentors(body);
  }
}

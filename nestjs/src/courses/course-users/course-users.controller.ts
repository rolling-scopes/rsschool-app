import {
  Controller,
  Get,
  Put,
  UseGuards,
  Param,
  ParseIntPipe,
  NotFoundException,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseRole, DefaultGuard, RequiredRoles } from 'src/auth';
import { CourseUsersService } from './course-users.service';
import { CourseUserDto } from './dto/course-user.dto';
import { PutUsersDto } from './dto/put-users.dto';
import { CourseRolesDto } from './dto/course-roles.dto';

@Controller('courses/:courseId/users')
@ApiTags('course user')
@UseGuards(DefaultGuard)
export class CourseUsersController {
  constructor(private readonly courseUserService: CourseUsersService) {}

  @Get()
  @ApiOperation({ operationId: 'getUsers' })
  @ApiNotFoundResponse()
  @ApiOkResponse({ type: [CourseUserDto] })
  @RequiredRoles([CourseRole.Manager])
  async getUsers(@Param('courseId', ParseIntPipe) courseId: number) {
    const users = await this.courseUserService.getCourseUsersByCourseId(courseId);

    if (!users.length) {
      throw new NotFoundException(`Users for course ${courseId} are not found`);
    }

    return users.map(user => new CourseUserDto(user));
  }

  @Put()
  @ApiOperation({ operationId: 'putUsers' })
  @ApiOkResponse()
  @RequiredRoles([CourseRole.Manager])
  async putUsers(@Param('courseId', ParseIntPipe) courseId: number, @Body() courseUsersWithRoles: PutUsersDto[]) {
    const { usersToInsert, usersToUpdate } = await this.courseUserService.getUsersToUpdateAndToInsert(
      courseUsersWithRoles,
      courseId,
    );

    if (usersToInsert.length) {
      await this.courseUserService.saveCourseUsers(usersToInsert);
    }

    if (usersToUpdate.length) {
      await this.courseUserService.updateCourseUsersRoles(usersToUpdate);
    }
  }

  @Put('/:githubId')
  @ApiOperation({ operationId: 'putUser' })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @RequiredRoles([CourseRole.Manager])
  async putUser(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('githubId') githubId: string,
    @Body() roles: CourseRolesDto,
  ) {
    const user = await this.courseUserService.getByGithubId(githubId, courseId);

    if (!user) {
      throw new BadRequestException(`User with ${githubId} is not found`);
    }

    const { isManager = false, isSupervisor = false, isDementor = false } = roles;
    const courseUser = await this.courseUserService.getByUserId(user.id, courseId);

    if (!courseUser) {
      await this.courseUserService.saveCourseUsers({ courseId, userId: user.id, isManager, isSupervisor, isDementor });
    } else {
      await this.courseUserService.updateCourseUser(user.id, { isManager, isSupervisor, isDementor });
    }
  }
}

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
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CourseRole, DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { UsersService } from 'src/users/users.service';

import { CourseUsersService } from './course-users.service';
import { CourseUserDto } from './dto/course-user.dto';
import { UpdateCourseUserDto } from './dto/update-user.dto';
import { CourseRolesDto } from './dto/course-roles.dto';

@Controller('courses/:courseId/users')
@ApiTags('course users')
@UseGuards(DefaultGuard, RoleGuard)
export class CourseUsersController {
  constructor(private readonly courseUserService: CourseUsersService, private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ operationId: 'getCourseUsers' })
  @ApiNotFoundResponse()
  @ApiOkResponse({ type: [CourseUserDto] })
  @RequiredRoles([CourseRole.Manager, Role.Admin], true)
  async getUsers(@Param('courseId', ParseIntPipe) courseId: number) {
    const users = await this.courseUserService.getCourseUsersByCourseId(courseId);

    if (!users.length) {
      throw new NotFoundException(`Users for course ${courseId} are not found`);
    }

    return users.map(user => new CourseUserDto(user));
  }

  @Put()
  @ApiOperation({ operationId: 'putCourseUsers' })
  @ApiBody({ type: [UpdateCourseUserDto] })
  @ApiOkResponse()
  @RequiredRoles([CourseRole.Manager, Role.Admin], true)
  async putUsers(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() courseUsersWithRoles: UpdateCourseUserDto[],
  ) {
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
  @ApiOperation({ operationId: 'putCourseUser' })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @RequiredRoles([CourseRole.Manager, Role.Admin], true)
  async putUser(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('githubId') githubId: string,
    @Body() roles: CourseRolesDto,
  ) {
    const user = await this.usersService.getByGithubId(githubId);

    if (!user) {
      throw new BadRequestException(`User with githubid ${githubId} is not found`);
    }

    const { isManager = false, isSupervisor = false, isDementor = false } = roles;
    const courseUser = await this.courseUserService.getByUserId(user.id, courseId);

    if (!courseUser) {
      await this.courseUserService.saveCourseUsers({ courseId, userId: user.id, isManager, isSupervisor, isDementor });
    } else {
      await this.courseUserService.updateCourseUser(courseUser.id, { isManager, isSupervisor, isDementor });
    }
  }
}

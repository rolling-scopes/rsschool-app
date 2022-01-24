import { Controller, ForbiddenException, Get, Header, Param, ParseIntPipe, Req, Res, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentRequest, DefaultGuard } from '../../auth';
import { CourseAccessService } from '../course-access.service';
import { CourseTaskDto } from './dto';
import { CourseTasksService } from './course-tasks.service';
import { Response } from 'express';

@Controller('courses/:courseId/tasks')
@ApiTags('courses tasks')
@UseGuards(DefaultGuard)
export class CourseTasksController {
  constructor(private courseAccessService: CourseAccessService, private courseTasksService: CourseTasksService) {}

  @Get()
  @Header('Cache-Control', 'max-age=60')
  @ApiOkResponse({ type: [CourseTaskDto] })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'getCourseTasks' })
  public async getOne(@Param('courseId', ParseIntPipe) courseId: number, @Req() req: CurrentRequest) {
    const hasAccess = await this.courseAccessService.canAccessCourse(req.user, courseId);
    if (!hasAccess) {
      throw new ForbiddenException();
    }
    const data = await this.courseTasksService.getAll(courseId);
    return data.map(item => new CourseTaskDto(item));
  }
}

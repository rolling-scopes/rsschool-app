import { Body, Controller, Delete, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CourseGuard, CourseRole, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../../auth';
import { CourseEventsService } from './course-events.service';
import { CourseEventDto } from './dto/course-event.dto';
import { CreateCourseEventDto } from './dto/create-course-event.dto';
import { UpdateCourseEventDto } from './dto/update-course-event.dto';

@Controller('courses/:courseId/events')
@ApiTags('courses events')
@UseGuards(DefaultGuard, CourseGuard, RoleGuard)
export class CourseEventsController {
  constructor(private courseEventsService: CourseEventsService) {}

  @Post('/')
  @ApiOkResponse({ type: [CourseEventDto] })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'createCourseEvent' })
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  public async createCourseTask(@Param('courseId', ParseIntPipe) courseId: number, @Body() dto: CreateCourseEventDto) {
    const result = await this.courseEventsService.createCourseEvent({
      courseId,
      ...dto,
    });

    return new CourseEventDto(result);
  }

  @Put('/:courseEventId')
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'updateCourseEvent' })
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  public async updateCourseTask(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('courseEventId', ParseIntPipe) courseEventId: number,
    @Body() dto: UpdateCourseEventDto,
  ) {
    await this.courseEventsService.updateCourseEvent(courseEventId, {
      courseId,
      id: courseEventId,
      ...dto,
    });
  }

  @Delete('/:courseEventId')
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiParam({ name: 'courseId' })
  @ApiOperation({ operationId: 'deleteCourseEvent' })
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  public async deleteCourseEvent(@Param('courseEventId', ParseIntPipe) courseEventId: number) {
    await this.courseEventsService.deleteCourseEvent(courseEventId);
  }
}

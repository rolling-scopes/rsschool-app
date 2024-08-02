import { CourseRole, DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { MentorReviewsService } from './mentor-reviews.service';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MentorReviewsDto, MentorReviewsQueryDto } from './dto';
import { MentorReviewAssignDto } from './dto/mentor-review-assign.dto';

@Controller('course/:courseId/mentor-reviews')
@ApiTags('mentor-reviews')
@UseGuards(DefaultGuard, RoleGuard)
export class MentorReviewsController {
  constructor(private mentorReviewsService: MentorReviewsService) {}

  @Get('/')
  @ApiOperation({ operationId: 'getMentorReviews' })
  @ApiOkResponse({ type: MentorReviewsDto })
  @RequiredRoles([CourseRole.Dementor, CourseRole.Manager, Role.Admin], true)
  public async getMentorReviews(
    @Query() query: MentorReviewsQueryDto,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    const page = parseInt(query.current);
    const limit = parseInt(query.pageSize);
    const { student, tasks, sortField, sortOrder } = query;
    const mentorReviews = await this.mentorReviewsService.getMentorReviews(
      courseId,
      page,
      limit,
      tasks,
      student,
      sortField,
      sortOrder,
    );

    return new MentorReviewsDto(mentorReviews);
  }

  @Post('/')
  @ApiOperation({ operationId: 'assignReviewer' })
  @ApiOkResponse({})
  @RequiredRoles([CourseRole.Dementor, CourseRole.Manager, Role.Admin], true)
  public async assignReviewer(@Param('courseId', ParseIntPipe) courseId: number, @Body() dto: MentorReviewAssignDto) {
    return await this.mentorReviewsService.assignReviewer(dto);
  }
}

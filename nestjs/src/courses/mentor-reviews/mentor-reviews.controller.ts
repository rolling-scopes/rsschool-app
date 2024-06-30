import { CourseRole, DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { MentorReviewsService } from './mentor-reviews.service';
import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MentorReviewsDto, MentorReviewsQueryDto } from './dto';

@Controller('course/:courseId/mentor-reviews')
@ApiTags('mentor-reviews')
@UseGuards(DefaultGuard, RoleGuard)
export class MentorReviewsController {
  constructor(private mentorReviewsService: MentorReviewsService) {}

  @Get('/')
  @ApiOperation({ operationId: 'getMentorReviews' })
  @ApiOkResponse({ type: MentorReviewsDto })
  @RequiredRoles([CourseRole.Dementor, CourseRole.Manager, Role.Admin], true)
  public async getScore(@Query() query: MentorReviewsQueryDto, @Param('courseId', ParseIntPipe) courseId: number) {
    const page = parseInt(query.current);
    const limit = parseInt(query.pageSize);
    const mentorReviews = await this.mentorReviewsService.getMentorReviews(courseId, page, limit, query.tasks);

    return new MentorReviewsDto(mentorReviews);
  }
}

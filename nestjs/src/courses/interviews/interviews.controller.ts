import { Controller, ForbiddenException, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentRequest, DefaultGuard } from '../../auth';
import { CourseAccessService } from '../course-access.service';
import { InterviewDto } from './dto';
import { InterviewsService } from './interviews.service';

@Controller('courses/:courseId/interviews')
@ApiTags('courses interviews')
@UseGuards(DefaultGuard)
export class InterviewsController {
  constructor(private courseAccessService: CourseAccessService, private courseTasksService: InterviewsService) {}

  @Get()
  @ApiOkResponse({ type: [InterviewDto] })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'getInterviews' })
  public async getOne(@Req() req: CurrentRequest, @Param('courseId', ParseIntPipe) courseId: number) {
    const hasAccess = await this.courseAccessService.canAccessCourse(req.user, courseId);
    if (!hasAccess) {
      throw new ForbiddenException();
    }
    const data = await this.courseTasksService.getAll(courseId);
    return data.map(item => new InterviewDto(item));
  }
}

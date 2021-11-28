import { ForbiddenException, Body, Controller, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { CurrentRequest, DefaultGuard } from 'src/auth';
import { CourseAccessService } from '../course-access.service';
import { CreateStudentFeedbackDto } from './dto/create-student-feedback.dto';
import { FeedbacksMapper } from './feedbacks.mapper';
import { FeedbacksService } from './feedbacks.service';

@Controller()
@ApiTags('course feedbacks')
export class FeedbacksController {
  constructor(
    private courseAccessService: CourseAccessService,
    private feedbackService: FeedbacksService,
    private feedbackMapper: FeedbacksMapper,
  ) {}

  @Post('student/:studentId/feedback')
  @UseGuards(DefaultGuard)
  public createStudentFeedback(
    @Param(':studentId', ParseIntPipe) studentId: number,
    @Body() body: CreateStudentFeedbackDto,
  ) {
    return this.feedbackService.createStudentFeedback(studentId, this.feedbackMapper.convertToEntity(studentId, body));
  }

  @Post('student/:studentId/feedback/:id')
  @UseGuards(DefaultGuard)
  public async getStudentFeedback(
    @Param(':studentId', ParseIntPipe) studentId: number,
    @Param(':id', ParseIntPipe) id: number,
    @Body() body: CreateStudentFeedbackDto,
    @Req() req: CurrentRequest,
  ) {
    const hasAccess = await this.courseAccessService.canAccessStudentFeedback(req.user, studentId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this student');
    }
    return this.feedbackService.createStudentFeedback(studentId, this.feedbackMapper.convertToEntity(studentId, body));
  }
}

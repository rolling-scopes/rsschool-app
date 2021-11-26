import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { CreateStudentFeedbackDto } from './dto/create-student-feedback.dto';
import { FeedbacksMapper } from './feedbacks.mapper';
import { FeedbacksService } from './feedbacks.service';

@Controller()
export class FeedbacksController {
  constructor(private feedbackService: FeedbacksService, private feedbackMapper: FeedbacksMapper) {}

  @Post('student/:id/feedback')
  @UseGuards(AuthGuard(['jwt', 'basic']))
  @ApiTags('course feedbacks')
  public createStudentFeedback(@Param(':id') studentId: number, @Body() body: CreateStudentFeedbackDto) {
    return this.feedbackService.createStudentFeedback(studentId, body);
  }
}

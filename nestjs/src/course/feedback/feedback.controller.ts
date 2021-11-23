import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateStudentFeedbackDto } from './dto/create-student-feedback.dto';
import { FeedbackService } from './feedback.service';

@Controller()
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Post('student/:id/feedback')
  @UseGuards(AuthGuard(['jwt', 'basic']))
  public createStudentFeedback(@Param(':id') studentId: number, @Body() body: CreateStudentFeedbackDto) {
    return this.feedbackService.createStudentFeedback(studentId, body);
  }
}

import {
  ForbiddenException,
  Body,
  Get,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentRequest, DefaultGuard } from 'src/auth';
import { CourseAccessService } from '../course-access.service';
import { CreateStudentFeedbackDto, StudentFeedbackDto } from './dto';
import { FeedbacksService } from './feedbacks.service';

@Controller()
@ApiTags('course feedbacks')
export class FeedbacksController {
  constructor(private courseAccessService: CourseAccessService, private feedbackService: FeedbacksService) {}

  @Post('students/:studentId/feedback')
  @UseGuards(DefaultGuard)
  public async createStudentFeedback(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() body: CreateStudentFeedbackDto,
    @Req() req: CurrentRequest,
  ) {
    const hasAccess = await this.courseAccessService.canAccessStudentFeedback(req.user, studentId);
    if (!hasAccess) {
      throw new ForbiddenException();
    }
    const feedback = await this.feedbackService.createStudentFeedback(studentId, body, req.user.id);
    return new StudentFeedbackDto(feedback);
  }

  @Get('students/:studentId/feedback/:id')
  @UseGuards(DefaultGuard)
  public async getStudentFeedback(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('id', ParseIntPipe) id: number,
    @Req() req: CurrentRequest,
  ) {
    const hasAccess = await this.courseAccessService.canAccessStudentFeedback(req.user, studentId);
    if (!hasAccess) {
      throw new ForbiddenException();
    }
    const feedback = await this.feedbackService.getStudentFeedback(studentId, id);
    return new StudentFeedbackDto(feedback);
  }
}

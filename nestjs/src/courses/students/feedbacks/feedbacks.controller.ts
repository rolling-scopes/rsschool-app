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
  Patch,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentRequest, DefaultGuard } from 'src/auth';
import { CourseAccessService } from '../../course-access.service';
import { CreateStudentFeedbackDto, StudentFeedbackDto, UpdateStudentFeedbackDto } from './dto';
import { FeedbacksService } from './feedbacks.service';

@Controller('students/:studentId/feedbacks')
@ApiTags('students feedbacks')
export class FeedbacksController {
  constructor(private courseAccessService: CourseAccessService, private feedbackService: FeedbacksService) {}

  @Post('/')
  @UseGuards(DefaultGuard)
  @ApiOperation({ operationId: 'createStudentFeedback' })
  @ApiCreatedResponse({ type: StudentFeedbackDto })
  public async createStudentFeedback(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() body: CreateStudentFeedbackDto,
    @Req() req: CurrentRequest,
  ) {
    const hasAccess = await this.courseAccessService.canAccessStudent(req.user, studentId);
    if (!hasAccess) {
      throw new ForbiddenException();
    }
    const feedback = await this.feedbackService.createStudentFeedback(studentId, body, req.user.id);
    return new StudentFeedbackDto(feedback);
  }

  @Patch('/:id')
  @UseGuards(DefaultGuard)
  public async updateStudentFeedback(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateStudentFeedbackDto,
    @Req() req: CurrentRequest,
  ) {
    const hasAccess = await this.courseAccessService.canAccessStudent(req.user, studentId);
    if (!hasAccess) {
      throw new ForbiddenException();
    }
    const feedback = await this.feedbackService.updateStudentFeedback(id, body);
    return new StudentFeedbackDto(feedback);
  }

  @Get('/:id')
  @UseGuards(DefaultGuard)
  @ApiResponse({ status: 200, type: StudentFeedbackDto })
  public async getStudentFeedback(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('id', ParseIntPipe) id: number,
    @Req() req: CurrentRequest,
  ) {
    const hasAccess = await this.courseAccessService.canAccessStudent(req.user, studentId);
    if (!hasAccess) {
      throw new ForbiddenException();
    }
    const feedback = await this.feedbackService.getStudentFeedback(id);
    if (feedback.studentId !== studentId) {
      throw new ForbiddenException();
    }
    return new StudentFeedbackDto(feedback);
  }
}

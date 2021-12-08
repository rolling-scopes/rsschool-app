import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentRequest, DefaultGuard } from 'src/auth';
import { StudentsService } from '../students.service';
import { CreateStudentFeedbackDto, StudentFeedbackDto, UpdateStudentFeedbackDto } from './dto';
import { FeedbacksService } from './feedbacks.service';

@Controller('students/:studentId/feedbacks')
@ApiTags('students feedbacks')
@UseGuards(DefaultGuard)
export class FeedbacksController {
  constructor(private stundentsService: StudentsService, private feedbackService: FeedbacksService) {}

  @Post('/')
  @ApiOperation({ operationId: 'createStudentFeedback' })
  @ApiCreatedResponse({ type: StudentFeedbackDto })
  public async createStudentFeedback(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() body: CreateStudentFeedbackDto,
    @Req() req: CurrentRequest,
  ) {
    const hasAccess = await this.stundentsService.canAccessStudent(req.user, studentId);
    if (!hasAccess) {
      throw new ForbiddenException();
    }
    const feedback = await this.feedbackService.createStudentFeedback(studentId, body, req.user.id);
    return new StudentFeedbackDto(feedback);
  }

  @Patch('/:id')
  @ApiOperation({ operationId: 'updateStudentFeedback' })
  @ApiOkResponse({ type: StudentFeedbackDto })
  public async updateStudentFeedback(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateStudentFeedbackDto,
    @Req() req: CurrentRequest,
  ) {
    const hasAccess = await this.stundentsService.canAccessStudent(req.user, studentId);
    if (!hasAccess) {
      throw new ForbiddenException();
    }
    const feedback = await this.feedbackService.update(id, body);
    return new StudentFeedbackDto(feedback);
  }

  @Get('/:id')
  @ApiOperation({ operationId: 'getStudentFeedback' })
  @ApiOkResponse({ type: StudentFeedbackDto })
  public async getStudentFeedback(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('id', ParseIntPipe) id: number,
    @Req() req: CurrentRequest,
  ) {
    const hasAccess = await this.stundentsService.canAccessStudent(req.user, studentId);
    if (!hasAccess) {
      throw new ForbiddenException();
    }
    const feedback = await this.feedbackService.getById(id);
    if (feedback.studentId !== studentId) {
      throw new ForbiddenException();
    }
    return new StudentFeedbackDto(feedback);
  }
}

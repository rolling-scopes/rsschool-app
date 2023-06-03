import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, RoleGuard } from '../../auth';
import { CreateTaskVerificationDto } from './dto/create-task-verification.dto';
import { TaskVerificationAttemptDto } from './dto/task-verifications-attempts.dto';
import { TaskVerificationsService } from './task-verifications.service';

@Controller('courses/:courseId/tasks/:courseTaskId/verifications')
@ApiTags('course task verifications')
export class TaskVerificationsController {
  constructor(private taskVerificationsService: TaskVerificationsService) {}

  @Get('/answers')
  @ApiOkResponse({ type: [TaskVerificationAttemptDto] })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'getAnswers' })
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([CourseRole.Student], true)
  public async getAnswers(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
  ) {
    const studentId = req.user.courses[courseId]?.studentId as number;
    return this.taskVerificationsService.getAnswersByAttempts(courseTaskId, studentId);
  }

  @Post('/')
  @ApiOperation({ operationId: 'createTaskVerification' })
  @ApiBody({ type: Object, required: true })
  @ApiOkResponse({ type: CreateTaskVerificationDto })
  @ApiBadRequestResponse()
  @ApiTooManyRequestsResponse()
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([CourseRole.Student])
  public async createVerification(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
    @Body() body: unknown,
  ) {
    const courseStatus = req.user.courses[courseId];
    const studentId = courseStatus?.studentId;

    if (!studentId) {
      throw new BadRequestException('You are not a student in this course');
    }
    if (courseStatus?.isExpelled) {
      throw new ForbiddenException('You are expelled from this course');
    }

    const githubId = req.user.githubId;
    return this.taskVerificationsService.createTaskVerification(courseTaskId, studentId, { githubId, body });
  }
}

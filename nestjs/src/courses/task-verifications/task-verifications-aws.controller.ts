import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WriteScoreService } from '../score';
import { TaskVerificationsService } from './task-verifications.service';

// AWS-lambda-facing endpoints, authenticated with HTTP Basic (cloud credentials).
// They mirror the legacy `basicAuthAws` routes 1:1, including the koa `{ data }` response envelope.
@Controller()
@ApiTags('course task verifications')
@UseGuards(AuthGuard('basic'))
export class TaskVerificationsAwsController {
  constructor(
    private taskVerificationsService: TaskVerificationsService,
    private writeScoreService: WriteScoreService,
  ) {}

  @Get('courses/:courseId/task-verifications')
  @ApiOperation({ operationId: 'getCourseTasksVerifications' })
  @ApiOkResponse({ schema: { type: 'object' } })
  public async getCourseTasksVerifications(@Param('courseId', ParseIntPipe) courseId: number) {
    const data = await this.taskVerificationsService.getCourseTasksVerifications(courseId);
    return { data };
  }

  @Put('task-verifications/:id')
  @ApiOperation({ operationId: 'updateTaskVerification' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOkResponse({ schema: { type: 'object' } })
  @ApiBadRequestResponse()
  public async updateTaskVerification(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { createdDate?: string; score: number; details: string; status: string },
  ) {
    try {
      // legacy strips createdDate before persisting
      const { createdDate: _createdDate, ...data } = body;
      const result = await this.taskVerificationsService.updateVerification(id, data);

      await this.writeScoreService.saveScore(result.studentId, result.courseTaskId, {
        comment: result.details,
        score: result.score,
      });

      return { data: result };
    } catch (err) {
      throw new BadRequestException((err as Error).message);
    }
  }
}

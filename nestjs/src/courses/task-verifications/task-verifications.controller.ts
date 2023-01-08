import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, RoleGuard } from '../../auth';
import { TaskVerificationsService } from './task-verifications.service';

@Controller('courses/:courseId/tasks/:courseTaskId/verifications')
@ApiTags('course task verifications')
export class TaskVerificationsController {
  constructor(private taskVerificationsService: TaskVerificationsService) {}

  @Get('/answers')
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ operationId: 'getAnswers' })
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([CourseRole.Student])
  public async getAnswers(
    @Req() req: CurrentRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
  ) {}
}

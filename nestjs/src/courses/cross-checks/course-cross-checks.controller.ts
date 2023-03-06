import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { CourseGuard, CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../../auth';
import { CourseTasksService } from '../course-tasks';
import { OrderField, OrderDirection, CourseCrossCheckService } from './course-cross-checks.service';
import { CrossCheckPairResponseDto } from './dto';
import { AvailableReviewStatsDto } from './dto/available-review-stats.dto';
import { parseAsync } from 'json2csv';
import { Response } from 'express';

@Controller('courses/:courseId/cross-checks')
@ApiTags('courses tasks')
@UseGuards(DefaultGuard, CourseGuard)
export class CourseCrossCheckController {
  constructor(
    private crossCheckPairsService: CourseCrossCheckService,
    private courseTasksService: CourseTasksService,
  ) {}

  @Get('/pairs')
  @ApiOperation({ operationId: 'getCrossCheckPairs' })
  @ApiForbiddenResponse()
  @ApiResponse({ type: CrossCheckPairResponseDto })
  @ApiQuery({ name: 'orderBy', required: false })
  @ApiQuery({ name: 'orderDirection', required: false })
  @ApiQuery({ name: 'checker', required: false })
  @ApiQuery({ name: 'student', required: false })
  @ApiQuery({ name: 'url', required: false })
  @ApiQuery({ name: 'task', required: false })
  @RequiredRoles([CourseRole.Manager, CourseRole.Dementor, Role.Admin], true)
  @UseGuards(DefaultGuard, RoleGuard)
  public async getPairs(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('pageSize') pageSize: number = 100,
    @Query('current') current: number = 1,
    @Query('orderBy', new DefaultValuePipe(OrderField.Student), new ParseEnumPipe(OrderField)) orderBy: OrderField,
    @Query('orderDirection', new DefaultValuePipe(OrderDirection.Asc), new ParseEnumPipe(OrderDirection))
    orderDirection: OrderDirection,
    @Query('checker') checker: string,
    @Query('student') student: string,
    @Query('url') url: string,
    @Query('task') task: string,
  ) {
    const { items, pagination } = await this.crossCheckPairsService.findPairs(
      courseId,
      { pageSize, current },
      { checker, student, url, task },
      { orderBy, orderDirection },
    );
    return new CrossCheckPairResponseDto(items, pagination);
  }

  @Get('/available-review-stats')
  @ApiOperation({ operationId: 'getAvailableCrossCheckReviewStats' })
  @ApiForbiddenResponse()
  @ApiResponse({ type: [AvailableReviewStatsDto] })
  @RequiredRoles([CourseRole.Student])
  @UseGuards(DefaultGuard, RoleGuard)
  public async getAvailableCrossCheckReviewStats(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: CurrentRequest,
  ) {
    const studentId = req.user.courses[courseId]?.studentId;
    if (!studentId) throw new BadRequestException();
    const crossChecks = await this.courseTasksService.getAvailableCrossChecks(courseId);
    if (crossChecks.length === 0) return [];
    const res = await this.crossCheckPairsService.getAvailableCrossChecksStats(crossChecks, studentId);
    return res.map(e => new AvailableReviewStatsDto(e));
  }

  @Get(':courseTaskId/csv')
  @ApiOperation({ operationId: 'getCrossCheckCsv' })
  @ApiForbiddenResponse()
  @RequiredRoles([CourseRole.Dementor, CourseRole.Manager, Role.Admin])
  @UseGuards(DefaultGuard, RoleGuard)
  public async getSolutionsUrls(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('courseTaskId', ParseIntPipe) courseTaskId: number,
    @Res() res: Response,
  ) {
    const [courseTask, solutionUrls] = await Promise.all([
      this.courseTasksService.getById(courseTaskId),
      this.crossCheckPairsService.getSolutionsUrls(courseId, courseTaskId),
    ]);

    const parsedData = await parseAsync(solutionUrls, { fields: ['githubId', 'solutionUrl'] });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-disposition', `filename=${courseTask.task.name}.csv`);

    res.end(parsedData);
  }
}

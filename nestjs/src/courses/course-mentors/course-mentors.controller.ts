import { CacheTTL, Controller, Get, Param, ParseIntPipe, Res, UseGuards } from '@nestjs/common';
import { CourseMentorsService } from './course-mentors.service';
import { CourseGuard, CourseRole, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../../auth';
import { DEFAULT_CACHE_TTL } from 'src/constants';
import { parseAsync, transforms } from 'json2csv';
import { Response } from 'express';
import { ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MentorDetailsDto } from './dto/mentor-details.dto';
import { SearchMentorDto } from './dto/search-mentor.dto';

@Controller('course/:courseId/mentors')
@ApiTags('course mentors')
export class CourseMentorsController {
  constructor(private readonly courseMentorsService: CourseMentorsService) {}

  @Get('details')
  @ApiOperation({ operationId: 'getMentorsDetails' })
  @ApiOkResponse({ type: [MentorDetailsDto] })
  @ApiForbiddenResponse()
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([Role.Admin, CourseRole.Manager, CourseRole.Supervisor], true)
  public async getMentorsDetails(@Param('courseId', ParseIntPipe) courseId: number) {
    const mentors = await this.courseMentorsService.getMentorsWithStats(courseId);
    return mentors.map(mentor => new MentorDetailsDto(mentor));
  }

  @Get('details/csv')
  @ApiOperation({ operationId: 'getMentorsDetailsCsv' })
  @ApiForbiddenResponse()
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([Role.Admin, CourseRole.Manager, CourseRole.Supervisor], true)
  public async getMentorsDetailsCsv(@Param('courseId', ParseIntPipe) courseId: number, @Res() res: Response) {
    const results = await this.courseMentorsService.getMentorsWithStats(courseId);
    const parsedData = await parseAsync(results, { transforms: [transforms.flatten()] });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-disposition', `filename=mentors.csv`);

    res.end(parsedData);
  }

  @Get('search/:searchText')
  @ApiOperation({ operationId: 'searchMentors' })
  @ApiOkResponse({ type: [SearchMentorDto] })
  @ApiForbiddenResponse()
  @CacheTTL(DEFAULT_CACHE_TTL)
  @UseGuards(DefaultGuard, CourseGuard)
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  public async searchMentors(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('searchText') searchText: string,
  ) {
    const mentors = await this.courseMentorsService.searchMentors(courseId, `${searchText}%`);
    return mentors.map(mentor => new SearchMentorDto(mentor));
  }
}

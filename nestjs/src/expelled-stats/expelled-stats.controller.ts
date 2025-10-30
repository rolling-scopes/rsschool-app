import { Controller, Get, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ExpelledStatsService } from './expelled-stats.service';
import { DetailedExpelledStat } from '../../../client/src/modules/CourseManagement/hooks/useExpelledStats';

@Controller('course/stats/expelled')
export class ExpelledStatsController {
  constructor(private readonly expelledStatsService: ExpelledStatsService) {}

  @Get()
  async findAll(): Promise<DetailedExpelledStat[]> {
    const responses = await this.expelledStatsService.findAll();
    return responses.map(res => ({
      id: res.id,
      course: {
        id: res.course.id,
        name: res.course.name,
        fullName: res.course.fullName,
        alias: res.course.alias,
        description: res.course.description,
        logo: res.course.logo,
      },
      user: {
        id: res.user.id,
        githubId: res.user.githubId,
      },
      reasonForLeaving: res.reasonForLeaving,
      otherComment: res.otherComment,
      submittedAt: res.submittedAt,
    }));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.expelledStatsService.remove(id);
  }
}

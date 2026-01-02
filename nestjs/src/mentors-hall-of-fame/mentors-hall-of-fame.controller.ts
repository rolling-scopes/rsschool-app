import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MentorsHallOfFameService } from './mentors-hall-of-fame.service';
import { PaginatedTopMentorsDto } from './dto';

@Controller('mentors-hall-of-fame')
@ApiTags('mentors-hall-of-fame')
export class MentorsHallOfFameController {
  constructor(private readonly service: MentorsHallOfFameService) {}

  @Get('/')
  @ApiOperation({ operationId: 'getTopMentors' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiOkResponse({ type: PaginatedTopMentorsDto })
  public async getTopMentors(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedTopMentorsDto> {
    const pageNum = Math.max(1, parseInt(page ?? '1', 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit ?? '20', 10) || 20));

    const { items, pagination } = await this.service.getTopMentors(pageNum, limitNum);
    return new PaginatedTopMentorsDto(items, pagination);
  }
}

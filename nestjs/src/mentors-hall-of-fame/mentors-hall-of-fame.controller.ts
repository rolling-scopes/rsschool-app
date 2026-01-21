import { Controller, DefaultValuePipe, Get, ParseBoolPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MentorsHallOfFameService } from './mentors-hall-of-fame.service';
import { TopMentorDto } from './dto';

@Controller('mentors-hall-of-fame')
@ApiTags('mentors-hall-of-fame')
export class MentorsHallOfFameController {
  constructor(private readonly service: MentorsHallOfFameService) {}

  @Get('/')
  @ApiOperation({ operationId: 'getTopMentors' })
  @ApiOkResponse({ type: [TopMentorDto] })
  @ApiQuery({ name: 'allTime', required: false, type: 'boolean' })
  public async getTopMentors(
    @Query('allTime', new DefaultValuePipe(false), ParseBoolPipe) allTime: boolean,
  ): Promise<TopMentorDto[]> {
    return this.service.getTopMentors(allTime);
  }
}

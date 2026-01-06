import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MentorsHallOfFameService } from './mentors-hall-of-fame.service';
import { TopMentorDto } from './dto';

@Controller('mentors-hall-of-fame')
@ApiTags('mentors-hall-of-fame')
export class MentorsHallOfFameController {
  constructor(private readonly service: MentorsHallOfFameService) {}

  @Get('/')
  @ApiOperation({ operationId: 'getTopMentors' })
  @ApiOkResponse({ type: [TopMentorDto] })
  public async getTopMentors(): Promise<TopMentorDto[]> {
    return this.service.getTopMentors();
  }
}

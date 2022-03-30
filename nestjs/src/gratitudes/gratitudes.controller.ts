import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentRequest, DefaultGuard } from '../auth';
import { BadgeDto, CreateGratitudeDto, GratitudeDto } from './dto';
import { GratitudesService } from './gratitudes.service';

@Controller('gratitudes')
@ApiTags('gratitudes')
@UseGuards(DefaultGuard)
export class GratitudesController {
  constructor(private readonly service: GratitudesService) {}

  @Post('/')
  @ApiOperation({ operationId: 'createGratitude' })
  @ApiOkResponse({ type: GratitudeDto })
  public async create(@Req() req: CurrentRequest, @Body() dto: CreateGratitudeDto) {
    const data = await this.service.create(req.user, dto);
    return new GratitudeDto(data);
  }

  @Get('/badges/:courseId')
  @ApiOperation({ operationId: 'getBadges' })
  @ApiOkResponse({ type: [BadgeDto] })
  public async getBadges(@Req() req: CurrentRequest, @Param('courseId', ParseIntPipe) courseId: number) {
    const badges = this.service.getBadges(req.user, courseId);
    return badges.map(badge => new BadgeDto(badge));
  }
}

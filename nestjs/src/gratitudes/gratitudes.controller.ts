import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentRequest, DefaultGuard } from '../auth';
import { BadgeDto, CreateGratitudeDto, GratitudeDto, HeroesRadarQueryDto } from './dto';
import { GratitudesService } from './gratitudes.service';
import { HeroesRadarDto } from './dto/heroes-radar.dto';
import { CountryDto } from './dto/country.dto';

@Controller('gratitudes')
@ApiTags('gratitudes')
@UseGuards(DefaultGuard)
export class GratitudesController {
  constructor(private readonly service: GratitudesService) {}

  @Post('/')
  @ApiOperation({ operationId: 'createGratitude' })
  @ApiOkResponse({ type: GratitudeDto })
  public async create(@Req() req: CurrentRequest, @Body() dto: CreateGratitudeDto) {
    await this.service.create(req.user, dto);
  }

  @Get('/badges/:courseId')
  @ApiOperation({ operationId: 'getBadges' })
  @ApiOkResponse({ type: [BadgeDto] })
  public async getBadges(@Req() req: CurrentRequest, @Param('courseId', ParseIntPipe) courseId: number) {
    const badges = this.service.getBadges(req.user, courseId);
    return badges.map(badge => new BadgeDto(badge));
  }

  @Get('/heroes/radar')
  @ApiOperation({ operationId: 'getHeroesRadar' })
  @ApiOkResponse({ type: HeroesRadarDto })
  public async getHeroesRadar(@Query() query: HeroesRadarQueryDto) {
    const heroes = await this.service.getHeroesRadar(query);

    return new HeroesRadarDto(heroes);
  }

  @Get('/heroes/countries')
  @ApiOperation({ operationId: 'getHeroesCountries' })
  @ApiOkResponse({ type: [CountryDto] })
  public async getHeroesContries() {
    const countries = await this.service.getHeroesCountries();
    return countries.map(country => new CountryDto(country));
  }
}

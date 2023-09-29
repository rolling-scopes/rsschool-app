import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../auth';
import { BadgeDto, CreateGratitudeDto, GratitudeDto, HeroesRadarQueryDto } from './dto';
import { GratitudesService } from './gratitudes.service';
import { HeroesRadarDto } from './dto/heroes-radar.dto';
import { CountryDto } from './dto/country.dto';
import { parseAsync, transforms } from 'json2csv';
import { Response } from 'express';

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
  @ApiForbiddenResponse()
  public async getHeroesRadar(@Req() req: CurrentRequest, @Query() query: HeroesRadarQueryDto) {
    const { isAdmin } = req.user;
    if (query.countryName && !isAdmin) {
      throw new ForbiddenException();
    }

    const heroes = await this.service.getHeroesRadar(query);

    return new HeroesRadarDto(heroes);
  }

  @Get('/heroes/radar/csv')
  @ApiOperation({ operationId: 'getHeroesRadarCsv' })
  @ApiForbiddenResponse()
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([Role.Admin], true)
  public async getHeroesRadarCsv(@Query() query: HeroesRadarQueryDto, @Res() res: Response) {
    const heroes = await this.service.getHeroesRadar(query);

    const parsedData = await parseAsync(new HeroesRadarDto(heroes).content, { transforms: [transforms.flatten()] });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-disposition', `filename=heroes-radar.csv`);

    res.end(parsedData);
  }

  @Get('/heroes/countries')
  @ApiOperation({ operationId: 'getHeroesCountries' })
  @ApiOkResponse({ type: [CountryDto] })
  public async getHeroesCountries() {
    const countries = await this.service.getHeroesCountries();
    return countries.map(country => new CountryDto(country));
  }
}

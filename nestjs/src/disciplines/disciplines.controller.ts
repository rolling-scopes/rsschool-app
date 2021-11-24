import { Discipline } from '@entities/discipline';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DefaultGuard, RequiredAppRoles, Role } from '../auth';
import { DisciplineMapper } from './disciplines.mapper';
import { DisciplinesService } from './disciplines.service';
import { DisciplineDto, SaveDisciplineDto } from './dto';

@Controller('disciplines')
@ApiTags('disciplines')
export class DisciplinesController {
  private mapper = new DisciplineMapper();

  constructor(private readonly service: DisciplinesService) {}

  @Post()
  @UseGuards(DefaultGuard)
  @RequiredAppRoles([Role.Admin])
  public create(@Body() dto: SaveDisciplineDto): Promise<DisciplineDto> {
    return this.service.create(this.mapper.convertToEntity(dto));
  }

  @Get()
  @UseGuards(DefaultGuard)
  @RequiredAppRoles([Role.Admin])
  public async getAll(): Promise<{ data: DisciplineDto[] }> {
    const data = await this.service.getAll();
    return { data: data.map(item => this.mapper.convertToDto(item)) };
  }

  @Delete(':id')
  @UseGuards(DefaultGuard)
  @RequiredAppRoles([Role.Admin])
  public remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Patch(':id')
  @UseGuards(DefaultGuard)
  @RequiredAppRoles([Role.Admin])
  public update(@Param('id', ParseIntPipe) id: number, @Body() dto: SaveDisciplineDto): Promise<DisciplineDto> {
    return this.service.update(id, this.mapper.convertToEntity(dto));
  }
}

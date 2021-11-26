import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { DefaultGuard, RequiredAppRoles, Role } from '../auth';
import { DisciplineMapper } from './disciplines.mapper';
import { DisciplinesService } from './disciplines.service';
import { DisciplineDto, CreateDisciplineDto, UpdateDisciplineDto } from './dto';

@Controller('disciplines')
@ApiTags('disciplines')
@UseGuards(DefaultGuard)
export class DisciplinesController {
  private mapper = new DisciplineMapper();

  constructor(private readonly service: DisciplinesService) {}

  @Post()
  @RequiredAppRoles([Role.Admin])
  @ApiResponse({ type: DisciplineDto })
  public create(@Body() dto: CreateDisciplineDto): Promise<DisciplineDto> {
    return this.service.create(this.mapper.convertToEntity(dto));
  }

  @Get()
  @RequiredAppRoles([Role.Admin])
  @ApiResponse({ type: DisciplineDto, isArray: true })
  public async getAll(): Promise<DisciplineDto[]> {
    const data = await this.service.getAll();
    return data.map(item => this.mapper.convertToDto(item));
  }

  @Delete(':id')
  @RequiredAppRoles([Role.Admin])
  public delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.markDeleted(id);
  }

  @Patch(':id')
  @RequiredAppRoles([Role.Admin])
  @ApiResponse({ type: DisciplineDto })
  public update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDisciplineDto): Promise<DisciplineDto> {
    return this.service.update(id, this.mapper.convertToEntity(dto));
  }
}

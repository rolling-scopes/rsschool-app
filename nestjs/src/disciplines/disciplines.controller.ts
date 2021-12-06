import { Discipline } from '@entities/discipline';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DefaultGuard, RequiredAppRoles, Role } from '../auth';
import { DisciplinesService } from './disciplines.service';
import { CreateDisciplineDto, DisciplineDto, UpdateDisciplineDto } from './dto';

@Controller('disciplines')
@ApiTags('disciplines')
@UseGuards(DefaultGuard)
export class DisciplinesController {
  constructor(private readonly service: DisciplinesService) {}

  @Post('/')
  @RequiredAppRoles([Role.Admin])
  @ApiOperation({ operationId: 'createDiscipline' })
  @ApiOkResponse({ type: DisciplineDto })
  public async create(@Body() dto: CreateDisciplineDto) {
    const data = await this.service.create(dto);
    return new DisciplineDto(data);
  }

  @Get('/')
  @RequiredAppRoles([Role.Admin])
  @ApiOperation({ operationId: 'getDisciplines' })
  @ApiOkResponse({ type: [DisciplineDto] })
  public async getAll() {
    const items = await this.service.getAll();
    return items.map(item => new DisciplineDto(item));
  }

  @Delete('/:id')
  @RequiredAppRoles([Role.Admin])
  @ApiOperation({ operationId: 'deleteDiscipline' })
  public async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Patch('/:id')
  @RequiredAppRoles([Role.Admin])
  @ApiOperation({ operationId: 'updateDiscipline' })
  @ApiOkResponse({ type: DisciplineDto })
  public async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDisciplineDto) {
    const data = await this.service.update(id, dto);
    return new DisciplineDto(data);
  }
}

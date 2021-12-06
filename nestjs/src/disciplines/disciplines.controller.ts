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

  @Post()
  @RequiredAppRoles([Role.Admin])
  @ApiOperation({ operationId: 'createDiscipline' })
  @ApiOkResponse({ type: DisciplineDto })
  public create(@Body() dto: CreateDisciplineDto): Promise<Discipline> {
    return this.service.create(dto);
  }

  @Get()
  @RequiredAppRoles([Role.Admin])
  @ApiOperation({ operationId: 'getDisciplines' })
  @ApiOkResponse({ type: [DisciplineDto] })
  public async getAll(): Promise<Discipline[]> {
    return await this.service.getAll();
  }

  @Delete(':id')
  @RequiredAppRoles([Role.Admin])
  @ApiOperation({ operationId: 'deleteDiscipline' })
  public delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Patch(':id')
  @RequiredAppRoles([Role.Admin])
  @ApiOperation({ operationId: 'updateDiscipline' })
  @ApiOkResponse({ type: DisciplineDto })
  public update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDisciplineDto): Promise<Discipline> {
    return this.service.update(id, dto);
  }
}

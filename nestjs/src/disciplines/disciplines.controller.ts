import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DefaultGuard, RequiredRoles, Role, RoleGuard } from '../auth';
import { DisciplinesService } from './disciplines.service';
import { CreateDisciplineDto, DisciplineDto, DisciplineIdsDto, UpdateDisciplineDto } from './dto';

@Controller('disciplines')
@ApiTags('disciplines')
@UseGuards(DefaultGuard, RoleGuard)
export class DisciplinesController {
  constructor(private readonly service: DisciplinesService) {}

  @Post('/')
  @RequiredRoles([Role.Admin])
  @ApiOperation({ operationId: 'createDiscipline' })
  @ApiOkResponse({ type: DisciplineDto })
  public async create(@Body() dto: CreateDisciplineDto) {
    const data = await this.service.create(dto);
    return new DisciplineDto(data);
  }

  @Get('/')
  @ApiOperation({ operationId: 'getDisciplines' })
  @ApiOkResponse({ type: [DisciplineDto] })
  public async getAll() {
    const items = await this.service.getAll();
    return items.map(item => new DisciplineDto(item));
  }

  @Post('/ids')
  @ApiOperation({ operationId: 'getDisciplinesByIds' })
  @ApiOkResponse({ type: [DisciplineDto] })
  public async getByIds(@Body() dto: DisciplineIdsDto) {
    const items = await this.service.getByIds(dto.ids);
    return items.map(item => new DisciplineDto(item));
  }

  @Delete('/:id')
  @RequiredRoles([Role.Admin])
  @ApiOperation({ operationId: 'deleteDiscipline' })
  public async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Patch('/:id')
  @RequiredRoles([Role.Admin])
  @ApiOperation({ operationId: 'updateDiscipline' })
  @ApiOkResponse({ type: DisciplineDto })
  public async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDisciplineDto) {
    const data = await this.service.update(id, dto);
    return new DisciplineDto(data);
  }
}

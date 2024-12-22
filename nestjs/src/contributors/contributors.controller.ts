import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DefaultGuard, RequiredRoles, Role, RoleGuard } from '../auth';
import { ContributorsService } from './contributors.service';
import { CreateContributorDto, ContributorDto, UpdateContributorDto } from './dto';

@Controller('contributors')
@ApiTags('contributors')
@UseGuards(DefaultGuard, RoleGuard)
export class ContributorsController {
  constructor(private readonly service: ContributorsService) {}

  @Post('/')
  @RequiredRoles([Role.Admin])
  @ApiOperation({ operationId: 'createContributor' })
  @ApiOkResponse({ type: ContributorDto })
  public async create(@Body() dto: CreateContributorDto) {
    const data = await this.service.create(dto);
    return new ContributorDto(data);
  }

  @Get('/')
  @ApiOperation({ operationId: 'getContributors' })
  @ApiOkResponse({ type: [ContributorDto] })
  public async getAll() {
    const items = await this.service.getAll();
    return items.map(item => new ContributorDto(item));
  }

  @Get('/:id')
  @ApiOperation({ operationId: 'getContributor' })
  @ApiOkResponse({ type: ContributorDto })
  public async getContributor(@Param('id', ParseIntPipe) id: number) {
    const item = await this.service.getById(id);
    return new ContributorDto(item);
  }

  @Delete('/:id')
  @RequiredRoles([Role.Admin])
  @ApiOperation({ operationId: 'deleteContributor' })
  public async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Patch('/:id')
  @RequiredRoles([Role.Admin])
  @ApiOperation({ operationId: 'updateContributor' })
  @ApiOkResponse({ type: ContributorDto })
  public async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateContributorDto) {
    const data = await this.service.update(id, dto);
    return new ContributorDto(data);
  }
}

import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DefaultGuard, RequiredRoles, Role, RoleGuard } from '../auth';
import { DiscordServersService } from './discord-servers.service';
import { DiscordServerDto, CreateDiscordServerDto, UpdateDiscordServerDto } from './dto';

@Controller('discord-servers')
@ApiTags('discord-servers')
@RequiredRoles([Role.Admin])
@UseGuards(DefaultGuard, RoleGuard)
export class DiscordServersController {
  constructor(private readonly service: DiscordServersService) {}

  @Post()
  @ApiOperation({ operationId: 'createDiscordServer' })
  @ApiOkResponse({ type: DiscordServerDto })
  public async create(@Body() dto: CreateDiscordServerDto) {
    const data = await this.service.create(dto);
    return new DiscordServerDto(data);
  }

  @Get()
  @ApiOperation({ operationId: 'getDiscordServers' })
  @ApiOkResponse({ type: [DiscordServerDto] })
  public async getAll() {
    const items = await this.service.getAll();
    return items.map(item => new DiscordServerDto(item));
  }

  @Put(':id')
  @ApiOperation({ operationId: 'updateDiscordServer' })
  @ApiOkResponse({ type: DiscordServerDto })
  public async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDiscordServerDto) {
    const data = await this.service.update(id, dto);
    return new DiscordServerDto(data);
  }

  @Delete(':id')
  @ApiOperation({ operationId: 'deleteDiscordServer' })
  @ApiOkResponse({ type: DiscordServerDto })
  public async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}

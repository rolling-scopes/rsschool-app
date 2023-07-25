import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DefaultGuard, RequiredRoles, Role, RoleGuard } from '../auth';
import { CreatePromptDto, PromptDto, UpdatePromptDto } from './dto';
import { PromptsService } from './prompts.service';

@Controller('prompts')
@ApiTags('prompts')
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Post('/')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([Role.Admin])
  @ApiOperation({ operationId: 'createPrompt' })
  @ApiOkResponse({ type: PromptDto })
  public async create(@Body() dto: CreatePromptDto) {
    const result = await this.promptsService.create(dto);
    return new PromptDto(result);
  }

  @Get('/')
  @UseGuards(DefaultGuard)
  @ApiOperation({ operationId: 'getPrompts' })
  @ApiOkResponse({ type: [PromptDto] })
  public async getAll(): Promise<PromptDto[]> {
    const data = await this.promptsService.findAll();
    return data.map(item => new PromptDto(item));
  }

  @Delete('/:id')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([Role.Admin])
  @ApiOperation({ operationId: 'deletePrompt' })
  @ApiOkResponse({})
  public async remove(@Param('id', ParseIntPipe) id: number) {
    return this.promptsService.remove(id);
  }

  @Patch('/:id')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([Role.Admin])
  @ApiOperation({ operationId: 'updatePrompt' })
  @ApiOkResponse({ type: PromptDto })
  public async update(@Param('id', ParseIntPipe) id: number, @Body() alert: UpdatePromptDto) {
    const result = await this.promptsService.update(id, alert);
    return new PromptDto(result);
  }
}

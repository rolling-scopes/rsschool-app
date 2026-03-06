import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DefaultGuard } from '../auth';
import { CreateRepositoryEventDto } from './dto';
import { RepositoriesService } from './repositories.service';

@Controller('repositories')
@ApiTags('repositories')
@UseGuards(DefaultGuard)
export class RepositoriesController {
  constructor(private readonly repositoriesService: RepositoriesService) {}

  @Post('/event')
  @ApiOperation({ operationId: 'createRepositoryEvent' })
  @ApiOkResponse()
  public async createRepositoryEvent(@Body() dto: CreateRepositoryEventDto[]): Promise<void> {
    await this.repositoriesService.createEvents(dto);
  }
}

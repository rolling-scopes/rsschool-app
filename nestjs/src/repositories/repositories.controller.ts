import { Body, Controller, HttpCode, ParseArrayPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateRepositoryEventDto } from './dto';
import { RepositoriesService } from './repositories.service';

@Controller('repositories')
@ApiTags('repositories')
@UseGuards(AuthGuard('basic'))
export class RepositoriesController {
  constructor(private readonly repositoriesService: RepositoriesService) {}

  @Post('/event')
  @HttpCode(200)
  @ApiOperation({ operationId: 'createRepositoryEvent' })
  @ApiBody({ type: [CreateRepositoryEventDto] })
  @ApiOkResponse()
  public async createRepositoryEvent(
    @Body(new ParseArrayPipe({ items: CreateRepositoryEventDto })) dto: CreateRepositoryEventDto[],
  ): Promise<void> {
    await this.repositoriesService.createEvents(dto);
  }
}

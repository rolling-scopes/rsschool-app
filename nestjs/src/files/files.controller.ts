import { Body, Controller, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentRequest, DefaultGuard } from '../auth';
import { CloudApiService } from '../cloud-api/cloud-api.service';

export class FileUploadResponseDto {
  @ApiProperty()
  s3Key: string;
}

@Controller('files')
@ApiTags('files')
@UseGuards(DefaultGuard)
export class FilesController {
  constructor(private readonly cloudApiService: CloudApiService) {}

  @Post('/upload')
  @ApiOperation({ operationId: 'uploadFile' })
  @ApiOkResponse({ type: FileUploadResponseDto })
  @ApiQuery({ name: 'key', required: false, type: String })
  @ApiBody({ schema: { type: 'object' } })
  public async uploadFile(@Req() req: CurrentRequest, @Body() body: unknown, @Query('key') key = '') {
    return this.cloudApiService.uploadFile(req.user.githubId, key, body);
  }
}

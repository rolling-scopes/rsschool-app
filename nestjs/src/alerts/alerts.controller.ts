import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DefaultGuard, RequiredAppRoles, Role, RoleGuard } from '../auth';
import { AlertsService } from './alerts.service';
import { AlertDto, CreateAlertDto, UpdateAlertDto } from './dto';

@Controller('alerts')
@ApiTags('alerts')
export class AlertsController {
  constructor(private readonly alertService: AlertsService) {}

  @Post('/')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredAppRoles([Role.Admin])
  @ApiOperation({ operationId: 'createAlert' })
  @ApiOkResponse({ type: AlertDto })
  public async create(@Body() createAlertDto: CreateAlertDto) {
    const result = await this.alertService.create(createAlertDto);
    return new AlertDto(result);
  }

  @Get('/')
  @UseGuards(DefaultGuard)
  @ApiOperation({ operationId: 'getAlerts' })
  @ApiOkResponse({ type: [AlertDto] })
  public async getAll(
    @Query('enabled', new DefaultValuePipe(true), ParseBoolPipe) enabled: boolean,
  ): Promise<AlertDto[]> {
    const data = await this.alertService.findAll({ enabled });
    return data.map(item => new AlertDto(item));
  }

  @Delete('/:id')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredAppRoles([Role.Admin])
  @ApiOperation({ operationId: 'deleteAlert' })
  @ApiOkResponse({})
  public async remove(@Param('id', ParseIntPipe) id: number) {
    return this.alertService.remove(id);
  }

  @Patch('/:id')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredAppRoles([Role.Admin])
  @ApiOperation({ operationId: 'updateAlert' })
  @ApiOkResponse({ type: AlertDto })
  public async update(@Param('id', ParseIntPipe) id: number, @Body() updateAlertDto: UpdateAlertDto) {
    const result = await this.alertService.update(id, updateAlertDto);
    return new AlertDto(result);
  }
}

import { Alert } from '@entities/alert';
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
import { ApiTags } from '@nestjs/swagger';
import { DefaultGuard } from '../auth';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

@Controller('alerts')
@ApiTags('alerts')
export class AlertsController {
  constructor(private readonly alertService: AlertsService) {}

  @Post()
  @UseGuards(DefaultGuard)
  create(@Body() createAlertDto: CreateAlertDto) {
    return this.alertService.create(createAlertDto);
  }

  @Get()
  @UseGuards(DefaultGuard)
  async getAll(
    @Query('enabled', new DefaultValuePipe(true), ParseBoolPipe) enabled: boolean,
  ): Promise<{ data: Alert[] }> {
    const data = await this.alertService.findAll({ enabled });
    return { data };
  }

  @Patch(':id')
  @UseGuards(DefaultGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAlertDto: UpdateAlertDto) {
    return this.alertService.update(id, updateAlertDto);
  }

  @Delete(':id')
  @UseGuards(DefaultGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.alertService.remove(id);
  }
}

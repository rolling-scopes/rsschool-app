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
import { AuthGuard } from '@nestjs/passport';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { Alert } from '@entities/alert';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertService: AlertsService) {}

  @Post()
  @UseGuards(AuthGuard(['jwt', 'basic']))
  create(@Body() createAlertDto: CreateAlertDto) {
    return this.alertService.create(createAlertDto);
  }

  @Get()
  @UseGuards(AuthGuard(['jwt', 'basic']))
  async getAll(
    @Query('enabled', new DefaultValuePipe(true), ParseBoolPipe) enabled: boolean,
  ): Promise<{ data: Alert[] }> {
    const data = await this.alertService.findAll({ enabled });
    return { data };
  }

  @Patch(':id')
  @UseGuards(AuthGuard(['jwt', 'basic']))
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAlertDto: UpdateAlertDto) {
    return this.alertService.update(id, updateAlertDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard(['jwt', 'basic']))
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.alertService.remove(id);
  }
}

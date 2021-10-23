import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { Alert, AlertType } from './entities/alert.entity';
import { omitBy, isUndefined } from 'lodash';

const fields: (keyof Alert)[] = ['id', 'text', 'type', 'courseId', 'enabled'];

const clean = <T>(alert: T) => omitBy(alert, isUndefined) as Partial<T>;

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private alertsRepository: Repository<Alert>,
  ) {}

  public async create(createAlertDto: CreateAlertDto) {
    const { text, type, courseId, enabled = false } = createAlertDto;
    await this.alertsRepository.insert({
      text,
      type: type as AlertType,
      courseId,
      enabled,
    });
  }

  public async findAll(): Promise<Alert[]> {
    const items = await this.alertsRepository.find({
      select: fields,
    });
    return items;
  }

  public async findEnabled(): Promise<Alert[]> {
    const items = await this.alertsRepository.find({
      where: { enabled: true },
      select: fields,
    });
    return items;
  }

  public async update(id: number, updateAlertDto: UpdateAlertDto) {
    const { text, type, courseId, enabled } = updateAlertDto;
    return this.alertsRepository.update(
      id,
      clean({
        text,
        type: type as AlertType,
        courseId,
        enabled,
      }),
    );
  }

  public async remove(id: number) {
    await this.alertsRepository.delete(id);
  }
}

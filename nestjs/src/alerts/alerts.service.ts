import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { Alert, AlertType } from '@entities/alert';
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
    const { id } = await this.alertsRepository.save({
      text,
      type: type as AlertType,
      courseId,
      enabled,
    });
    return this.alertsRepository.findOne(id);
  }

  public async findAll({ enabled }: { enabled: boolean }): Promise<Alert[]> {
    const items = await this.alertsRepository.find({
      where: { enabled },
      select: fields,
    });
    return items;
  }

  public async update(id: number, updateAlertDto: UpdateAlertDto) {
    const { text, type, courseId, enabled } = updateAlertDto;
    await this.alertsRepository.update(
      id,
      clean({
        text,
        type: type as AlertType,
        courseId,
        enabled,
      }),
    );
    return this.alertsRepository.findOne(id);
  }

  public async remove(id: number) {
    await this.alertsRepository.delete(id);
  }
}

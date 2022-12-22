import { Event } from '@entities/event';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto, UpdateEventDto } from './dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private repository: Repository<Event>,
  ) {}

  public async findAll() {
    return this.repository.find({ order: { updatedDate: 'DESC' }, relations: ['discipline'] });
  }

  public async create(data: CreateEventDto) {
    const { id } = await this.repository.save(data);
    return this.repository.findOneByOrFail({ id });
  }

  public async update(id: number, data: UpdateEventDto) {
    await this.repository.update(id, data);
    return this.repository.findOneByOrFail({ id });
  }

  public async remove(id: number) {
    await this.repository.delete(id);
  }
}

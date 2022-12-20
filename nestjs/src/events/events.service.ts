import { Event } from '@entities/event';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private repository: Repository<Event>,
  ) {}

  findAll() {
    return this.repository.find({ order: { updatedDate: 'DESC' }, relations: ['discipline'] });
  }
}

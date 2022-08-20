import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEvent } from '@entities/courseEvent';

export enum Status {
  Started = 'started',
  InProgress = 'inprogress',
  Finished = 'finished',
}

@Injectable()
export class CourseEventsService {
  constructor(
    @InjectRepository(CourseEvent)
    readonly courseEventRepository: Repository<CourseEvent>,
  ) {}

  public async createCourseEvent(courseEvent: Partial<Omit<CourseEvent, 'organizer'> & { organizer: { id: number } }>) {
    const { id } = await this.courseEventRepository.save(courseEvent);
    return this.courseEventRepository.findOneOrFail(id, { relations: ['organizer', 'event'] });
  }

  public async updateCourseEvent(
    id: number,
    courseEvent: Partial<Omit<CourseEvent, 'organizer'> & { organizer: { id: number } }>,
  ) {
    await this.courseEventRepository.update(id, courseEvent);
    return this.courseEventRepository.findOneOrFail(id);
  }

  public async deleteCourseEvent(id: number) {
    const entity = await this.courseEventRepository.findOneOrFail(id);
    return this.courseEventRepository.remove(entity);
  }
}

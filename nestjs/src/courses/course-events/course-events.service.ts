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

  createCourseEvent(courseEvent: Partial<Omit<CourseEvent, 'organizer'> & { organizer: { id: number } }>) {
    return this.courseEventRepository.insert(courseEvent);
  }

  updateCourseEvent(id: number, courseEvent: Partial<Omit<CourseEvent, 'organizer'> & { organizer: { id: number } }>) {
    return this.courseEventRepository.update(id, courseEvent);
  }

  delete(id: number) {
    return this.courseEventRepository.delete(id);
  }
}

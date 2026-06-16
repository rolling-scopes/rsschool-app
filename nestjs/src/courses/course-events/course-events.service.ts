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

  public async getCourseEvents(courseId: number) {
    return this.courseEventRepository
      .createQueryBuilder('courseEvent')
      .innerJoinAndSelect('courseEvent.event', 'event')
      .leftJoin('courseEvent.organizer', 'organizer')
      .addSelect(['organizer.id', 'organizer.firstName', 'organizer.lastName', 'organizer.githubId'])
      .where('courseEvent.courseId = :courseId', { courseId })
      .orderBy('courseEvent.dateTime')
      .getMany();
  }

  public async createCourseEvent(courseEvent: Partial<Omit<CourseEvent, 'organizer'> & { organizer: { id: number } }>) {
    const { id } = await this.courseEventRepository.save(courseEvent);
    return this.courseEventRepository.findOneOrFail({ where: { id }, relations: ['organizer', 'event'] });
  }

  public async updateCourseEvent(
    id: number,
    courseEvent: Partial<Omit<CourseEvent, 'organizer'> & { organizer: { id: number } }>,
  ) {
    await this.courseEventRepository.update(id, courseEvent);
    return this.courseEventRepository.findOneByOrFail({ id });
  }

  public async deleteCourseEvent(id: number) {
    const entity = await this.courseEventRepository.findOneByOrFail({ id });
    return this.courseEventRepository.remove(entity);
  }
}

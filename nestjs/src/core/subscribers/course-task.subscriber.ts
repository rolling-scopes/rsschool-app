import { CourseTask } from '@entities/courseTask';
import { EventSubscriber } from 'typeorm';
import { BaseSubscriber } from './base-subscriber';

@EventSubscriber()
export class CourseTaskSubscriber extends BaseSubscriber {
  listenTo() {
    return CourseTask;
  }
}

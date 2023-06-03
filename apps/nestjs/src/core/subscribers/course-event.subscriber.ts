import { CourseEvent } from '@entities/courseEvent';
import { EventSubscriber } from 'typeorm';
import { BaseSubscriber } from './base-subscriber';

@EventSubscriber()
export class CourseEventSubscriber extends BaseSubscriber {
  listenTo() {
    return CourseEvent;
  }
}

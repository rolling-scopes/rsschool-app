import { CourseEvent } from '@entities/courseEvent';
import { BaseSubscriber } from './base-subscriber';
import { CourseEventSubscriber } from './course-event.subscriber';

describe('CourseEventSubscriber', () => {
  const subscriber = new CourseEventSubscriber();

  it('should be defined', () => {
    expect(subscriber).toBeDefined();
  });

  it('extends BaseSubscriber', () => {
    expect(subscriber).toBeInstanceOf(BaseSubscriber);
  });

  it('listens to the CourseEvent entity', () => {
    expect(subscriber.listenTo()).toBe(CourseEvent);
  });
});

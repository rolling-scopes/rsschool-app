import { CourseTask } from '@entities/courseTask';
import { BaseSubscriber } from './base-subscriber';
import { CourseTaskSubscriber } from './course-task.subscriber';

describe('CourseTaskSubscriber', () => {
  const subscriber = new CourseTaskSubscriber();

  it('should be defined', () => {
    expect(subscriber).toBeDefined();
  });

  it('extends BaseSubscriber', () => {
    expect(subscriber).toBeInstanceOf(BaseSubscriber);
  });

  it('listens to the CourseTask entity', () => {
    expect(subscriber.listenTo()).toBe(CourseTask);
  });
});

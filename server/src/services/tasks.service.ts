import { CourseTask } from '../models/courseTask';
import { getRepository } from 'typeorm';

export async function getCourseTask(courseTaskId: number, selectCourse = false) {
  const query = getRepository(CourseTask)
    .createQueryBuilder('courseTask')
    .innerJoinAndSelect('courseTask.task', 'task')
    .where('courseTask.id = :courseTaskId', { courseTaskId });
  if (selectCourse) {
    query.innerJoinAndSelect('courseTask.course', 'course');
  }
  return query.getOne();
}

export async function getCourseTaskOnly(courseTaskId: number): Promise<{ id: number } | null> {
  return getRepository(CourseTask)
    .createQueryBuilder('courseTask')
    .where('courseTask.id = :courseTaskId', { courseTaskId: Number(courseTaskId) })
    .getOne();
}

export async function changeCourseTaskProcessing(courseTaskId: number, isCreatingInterviewPairs: boolean) {
  await getRepository(CourseTask).update(courseTaskId, { isCreatingInterviewPairs });
}

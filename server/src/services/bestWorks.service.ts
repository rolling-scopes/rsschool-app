import { getRepository } from 'typeorm';
import { BestWork, Course, Task, User } from '../models';

interface IPostBestWork {
  users: string[];
  task: Task;
  imageUrl: string;
  tags: string[];
  course: Course;
}

export async function getAllBestWorks() {
  const bestWorkRepository = getRepository(BestWork);
  const result = await bestWorkRepository.find({
    relations: ['users', 'task', 'course'],
  });
  return result;
}

export async function getBestWorksByTaskId(id: number) {
  const bestWorkRepository = getRepository(BestWork);
  const result = await bestWorkRepository.find({
    relations: ['users', 'task', 'course'],
    where: { task: { id } },
  });
  return result;
}

export async function postBestWork(data: IPostBestWork) {
  const { users, ...toSave } = data;
  const userRepository = getRepository(User);
  const usersFromDB = await userRepository
    .createQueryBuilder('user')
    .where('user.githubId IN (:...id)', { id: users })
    .getMany();

  const bestWorkRepository = getRepository(BestWork);
  const result = await bestWorkRepository.save({ ...toSave, usersFromDB });

  return result;
}

export async function getCourseListWithBestWorks() {
  const bestWorkRepository = getRepository(BestWork);
  const courses = await bestWorkRepository
    .createQueryBuilder('bw')
    .select('bw."courseId"', 'courseId')
    .addSelect('c.name', 'courseName')
    .innerJoin(Course, 'c', 'bw."courseId" = c.id')
    .groupBy('bw."courseId"')
    .addGroupBy('c.name')
    .getRawMany();
  return courses;
}

export async function getCourseTaskListWithBestWorks(id: number) {
  const bestWorkRepository = getRepository(BestWork);
  const tasks = await bestWorkRepository
    .createQueryBuilder('bw')
    .select('bw."taskId"', 'taskId')
    .addSelect('t.name', 'taskName')
    .innerJoin(Task, 't', 'bw."taskId" = t.id')
    .where('bw."courseId" = :courseId', { courseId: id })
    .groupBy('bw."taskId"')
    .addGroupBy('t.name')
    .getRawMany();
  return tasks;
}

import { getRepository } from 'typeorm';
import { BestWork, Course, Task, User } from '../models';

interface IPostBestWork {
  id?: number;
  users: number[];
  task: Task;
  projectUrl: string;
  imageUrl: string;
  tags: string[];
  course: Course;
}

async function changeToResponse(values: BestWork[], isUpdate: boolean = false) {
  const result = values.map(e => {
    const { users: usersFromDB, course, task, createdDate, updatedDate, ...data } = e;
    const users = usersFromDB.map(u => {
      const { id, githubId, firstName, lastName } = u;
      const name = [];
      if (firstName) name.push(firstName);
      if (lastName) name.push(lastName);
      return { id, githubId, name: name.join(' ') };
    });
    return { users, task: isUpdate ? task : task.id, course: isUpdate ? course : course.id, ...data };
  });
  return result;
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
  return changeToResponse(result);
}

export async function postBestWork(data: IPostBestWork) {
  const { users, ...toSave } = data;
  const userRepository = getRepository(User);
  const usersFromDB = await userRepository
    .createQueryBuilder('user')
    .where('user.id IN (:...id)', { id: users })
    .getMany();
  const bestWorkRepository = getRepository(BestWork);
  const result = await bestWorkRepository.save({ ...toSave, users: usersFromDB });
  return changeToResponse([result]);
}

export async function changeBestWork(data: BestWork) {
  try {
    const bestWorkRepository = getRepository(BestWork);
    const bestWorkFormDB = await bestWorkRepository.findOne({ where: { id: data.id } });
    if (!bestWorkFormDB) throw new Error('Best work not found');
    let { users } = data;
    if (users) {
      const userRepository = getRepository(User);
      users = await userRepository.createQueryBuilder('user').where('user.id IN (:...id)', { id: users }).getMany();
    }
    const updatedBestWork = { ...bestWorkFormDB, ...data, users };
    const result = await bestWorkRepository.save(updatedBestWork);
    const isUpdate = true;
    return changeToResponse([result], isUpdate);
  } catch (e) {
    return {
      message: e.message,
    };
  }
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

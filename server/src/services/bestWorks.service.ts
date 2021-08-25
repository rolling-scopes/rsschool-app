import { getRepository } from 'typeorm';
import { BestWork, Course, Task, User } from '../models';

interface IPostBestWork {
  githubId: string[];
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
  const { githubId, ...toSave } = data;
  const userRepository = getRepository(User);
  const users = await userRepository
    .createQueryBuilder('user')
    .where('user.githubId IN (:...githubIds)', { githubIds: githubId })
    .getMany();

  const bestWorkRepository = getRepository(BestWork);
  const result = await bestWorkRepository.save({ ...toSave, users });

  return result;
}

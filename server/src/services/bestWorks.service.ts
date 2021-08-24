import { getRepository } from 'typeorm';
import { BestWork } from '../models';

export async function getBestWorksByTaskId(id: number) {
  const bestWorkRepository = getRepository(BestWork);
  const result = await bestWorkRepository.find({
    relations: ['users', 'task', 'course'],
    where: { task: id },
  });
  return result;
}

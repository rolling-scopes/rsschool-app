import { User } from '../models';
import { getRepository, In } from 'typeorm';

export function getUserByGithubId(id: string) {
  const githubId = id.toLowerCase();
  return getRepository(User).findOne({ where: { githubId } });
}

export function getFullUserByGithubId(id: string) {
  const githubId = id.toLowerCase();

  return getRepository(User).findOne({
    where: { githubId },
    relations: ['mentors', 'students', 'mentors.course', 'students.course', 'courseManagers', 'courseManagers.course'],
  });
}

export function getFullUserById(id: number) {
  return getRepository(User).findOne({
    where: { id },
    relations: ['mentors', 'students', 'mentors.course', 'students.course'],
  });
}

export function getUserById(id: number) {
  return getRepository(User).findOne({ where: { id } });
}

export function saveUser(user: User) {
  return getRepository(User).save(user);
}

export function getUsersByIds(ids: number[]) {
  return getRepository(User).find({
    where: { id: In(ids) },
  });
}

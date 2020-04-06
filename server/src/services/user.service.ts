import { User } from '../models';
import { getRepository } from 'typeorm';

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

export function createName({ firstName, lastName }: { firstName: string; lastName: string }) {
  const result = [];
  if (firstName) {
    result.push(firstName.trim());
  }
  if (lastName) {
    result.push(lastName.trim());
  }
  return result.join(' ');
}

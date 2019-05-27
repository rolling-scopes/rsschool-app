import { User } from '../models';
import { getRepository } from 'typeorm';

export async function getUserByGithubId(id: string) {
  const githubId = id.toLowerCase();
  return getRepository(User).findOne({ where: { githubId } });
}

export async function getFullUserByGithubId(id: string) {
  const githubId = id.toLowerCase();
  return getRepository(User).findOne({
    where: { githubId },
    relations: ['mentors', 'students', 'mentors.course', 'students.course'],
  });
}

export async function getFullUserById(id: number) {
  return getRepository(User).findOne({
    where: { id },
    relations: ['mentors', 'students', 'mentors.course', 'students.course'],
  });
}

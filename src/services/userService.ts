import { User } from '../models';
import { getRepository } from 'typeorm';

export async function getUserByGithubId(userId: string) {
  const githubId = userId.toLowerCase();
  return getRepository(User).findOne({ where: { githubId } });
}

export async function getFullUserByGithubId(userId: string) {
  const githubId = userId.toLowerCase();
  return getRepository(User).findOne({
    where: { githubId },
    relations: ['mentors', 'students', 'mentors.course', 'students.course'],
  });
}

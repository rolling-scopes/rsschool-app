import { User } from '../models';
import { getRepository } from 'typeorm';

export async function getUserByGithubId(userId: string) {
  return getRepository(User).findOne({ where: { githubId: userId } });
}

export async function getFullUserByGithubId(userId: string) {
  return getRepository(User).findOne({
    where: { githubId: userId },
    relations: ['mentors', 'students', 'mentors.course', 'students.course'],
  });
}

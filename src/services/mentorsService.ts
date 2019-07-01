import { Mentor } from '../models';
import { getRepository } from 'typeorm';

export async function getCourseMentorWithUser(courseId: number, userId: number) {
  return await getRepository(Mentor)
    .createQueryBuilder('mentor')
    .innerJoinAndSelect('mentor.user', 'user')
    .where('mentor."courseId" = :courseId AND mentor.user.id = :id', { id: userId, courseId })
    .getOne();
}

export async function getMentorByGithubId(githubId: string) {
  return await getRepository(Mentor)
    .createQueryBuilder('mentor')
    .innerJoinAndSelect('mentor.user', 'user')
    .where('"user"."githubId" = :githubId', { githubId })
    .getOne();
}

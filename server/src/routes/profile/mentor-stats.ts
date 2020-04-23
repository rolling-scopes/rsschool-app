import { getRepository } from 'typeorm';
import { MentorStats } from '../../../../common/models/profile';
import { getFullName } from '../../rules';
import { User, Mentor, Student, Course } from '../../models';
import { RepositoryService } from '../../services';

export const getMentorStats = async (githubId: string): Promise<MentorStats[]> =>
  (
    await getRepository(Mentor)
      .createQueryBuilder('mentor')
      .select('"course"."name" AS "courseName"')
      .addSelect('"course"."alias" AS "courseAlias"')
      .addSelect('"course"."id" AS "courseId"')
      .addSelect('"course"."locationName" AS "courseLocationName"')
      .addSelect('ARRAY_AGG ("userStudent"."githubId") AS "studentGithubIds"')
      .addSelect('ARRAY_AGG ("userStudent"."firstName") AS "studentFirstNames"')
      .addSelect('ARRAY_AGG ("userStudent"."lastName") AS "studentLastNames"')
      .addSelect('ARRAY_AGG ("student"."isExpelled") AS "studentIsExpelledStatuses"')
      .addSelect('ARRAY_AGG ("student"."totalScore") AS "studentTotalScores"')
      .leftJoin(User, 'user', '"user"."id" = "mentor"."userId"')
      .leftJoin(Course, 'course', '"course"."id" = "mentor"."courseId"')
      .leftJoin(Student, 'student', '"student"."mentorId" = "mentor"."id"')
      .leftJoin(User, 'userStudent', '"userStudent"."id" = "student"."userId"')
      .where('"user"."githubId" = :githubId', { githubId })
      .groupBy('"course"."id"')
      .orderBy('"course"."updatedDate"', 'DESC')
      .getRawMany()
  ).map(
    ({
      courseName,
      courseId,
      courseAlias,
      courseLocationName,
      studentGithubIds,
      studentFirstNames,
      studentLastNames,
      studentIsExpelledStatuses,
      studentTotalScores,
    }: any) => {
      const repositoryService = new RepositoryService(Number(courseId));
      const students = studentGithubIds[0]
        ? studentGithubIds.map((githubId: string, idx: number) => ({
            githubId,
            name: getFullName(studentFirstNames[idx], studentLastNames[idx], githubId),
            isExpelled: studentIsExpelledStatuses[idx],
            totalScore: studentTotalScores[idx],
            repoUrl: `https://github.com/rolling-scopes-school/${repositoryService.getRepoName(githubId, {
              alias: courseAlias,
            })}`,
          }))
        : undefined;
      return { courseLocationName, courseName, students };
    },
  );

import { User } from '@entities/user';
import { LoginState } from '@entities/loginState';
import { createQueryBuilder, EntityRepository, Repository } from 'typeorm';
import { CourseUser } from '@entities/courseUser';

export type AuthDetails = {
  id: number;
  githubId: string;
  students: { courseId: number; id: number }[];
  mentors: { courseId: number; id: number }[];
  courseUsers: CourseUser[];
};

@EntityRepository(LoginState)
export class AuthRepository extends Repository<LoginState> {
  public async getAuthDetails(githubId: string): Promise<AuthDetails> {
    const query = createQueryBuilder(User, 'user')
      .select('user.id', 'id')
      .addSelect('user.githubId', 'githubId')
      .addSelect(
        qb =>
          qb
            .select(`jsonb_agg(json_build_object('id', mentor.id, 'courseId', mentor."courseId"))`)
            .from('mentor', 'mentor')
            .where('mentor.userId = user.id'),
        'mentors',
      )
      .addSelect(
        qb =>
          qb
            .select(`jsonb_agg(json_build_object('id', student.id, 'courseId', student."courseId"))`)
            .from('student', 'student')
            .where('student.userId = user.id'),
        'students',
      )
      .addSelect(
        qb => qb.select('jsonb_agg("courseUser")').from(CourseUser, 'courseUser').where('courseUser.userId = user.id'),
        'courseUsers',
      )
      .where({
        githubId,
      });

    const result = await query.getRawOne();
    return {
      id: result.id,
      githubId: result.githubId,
      students: result.students ?? [],
      mentors: result.mentors ?? [],
      courseUsers: result.courseUsers ?? [],
    };
  }
}

/*

SELECT
  "user"."id" AS "user_id",
  "user"."githubId" AS "user_githubId",
  (SELECT jsonb_agg(id) FROM mentor WHERE mentor."userId" = "user"."id") as "mentors",
  (SELECT jsonb_agg(id) FROM student WHERE student."userId" = "user"."id") as "students",
  (SELECT jsonb_agg(course_user) FROM course_user WHERE course_user."userId" = "user"."id") as "courseUsers"
FROM
  "user" "user"
WHERE
  "user"."githubId" = 'valerydluski'
GROUP BY user_id

*/

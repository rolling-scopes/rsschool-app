import * as Router from 'koa-router';
import { getRepository } from 'typeorm';
import axios from 'axios';
import { OK } from 'http-status-codes';
import { ILogger } from '../../logger';
import { Student } from '../../models';
import { setResponse } from '../utils';
import { config } from '../../config';

export const postCertificates = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = ctx.params.courseId;
  const inputIds = ctx.request.body as { studentId: number }[];
  let students: Student[] = [];
  const initialQuery = getRepository(Student)
    .createQueryBuilder('student')
    .innerJoin('student.course', 'course')
    .innerJoin('student.user', 'user')
    .addSelect([
      'user.id',
      'user.firstName',
      'user.lastName',
      'user.githubId',
      'course.name',
      'course.primarySkillName',
    ]);
  if (Array.isArray(inputIds) && inputIds.length > 0) {
    students = await initialQuery
      .where('student."id" IN (:...ids)', {
        ids: inputIds,
      })
      .getMany();
  } else {
    students = await initialQuery
      .leftJoinAndSelect('student.certificate', 'certificate')
      .where(
        [
          'certificate.id IS NULL',
          'student."courseId" = :courseId',
          'student."isExpelled" = false',
          'student."isFailed" = false',
        ].join(' AND '),
        {
          courseId,
        },
      )
      .getMany();
  }

  const result = students.map(student => {
    const course = student.course!;
    const user = student.user!;
    return {
      courseId,
      courseName: course.name,
      coursePrimarySkill: course.primarySkillName,
      studentId: student.id,
      studentName: `${user.firstName} ${user.lastName}`,
      timestamp: Date.now(),
    };
  });
  await axios.post(config.aws.certificateGenerationUrl, result, {
    headers: { 'x-api-key': config.aws.certificateGenerationApiKey },
  });
  setResponse(ctx, OK, result);
};

import * as Router from 'koa-router';
import { OK } from 'http-status-codes';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { StudentFeedback } from '../../models';
import { setResponse } from '../utils';
import { userService, studentsService } from '../../services';

interface StudentInput {
  githubId: string;
  comment: string;
}

export const postStudentsFeedbacks = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const data: StudentInput[] = ctx.request.body;

  const result = [];
  for await (const item of data) {
    const user = await userService.getUserByGithubId(item.githubId);

    if (user == null || user.id == null) {
      result.push({ status: 'skipped', value: `no user: ${item.githubId}` });
      continue;
    }

    const student = await studentsService.getCourseStudent(courseId, user.id);

    if (student) {
      const feedbackRepo = await getRepository(StudentFeedback);
      const feedback = await feedbackRepo.save({ student: student.id, comment: item.comment });
      result.push(feedback);
    }
  }

  setResponse(ctx, OK, result);
};

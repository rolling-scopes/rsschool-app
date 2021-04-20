import Router from '@koa/router';
import { OK } from 'http-status-codes';
import { getRepository } from 'typeorm';
import { ILogger } from '../../../logger';
import { IUserSession, Student, TaskResult } from '../../../models';
import { OperationResult, taskResultsService } from '../../../services';
import { setResponse } from '../../utils';

type ScoresInput = {
  studentGithubId: string;
  courseTaskId: number;
  score: number;
  comment: string;
  githubPrUrl?: string;
  mentorGithubId?: string;
};

export const createMultipleScores = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const courseTaskId: number = ctx.params.courseTaskId;

  const inputData: ScoresInput[] = ctx.request.body;
  const result: OperationResult[] = [];

  for await (const item of inputData) {
    try {
      logger.info(item.studentGithubId);

      const data = {
        studentGithubId: item.studentGithubId,
        courseTaskId,
        score: Math.round(Number(item.score)),
        comment: item.comment || '',
        githubPrUrl: item.githubPrUrl || '',
      };

      const { studentGithubId } = data;

      const student = await getRepository(Student)
        .createQueryBuilder('student')
        .innerJoinAndSelect('student.user', 'user')
        .where('"user"."githubId" = :studentGithubId AND "student"."courseId" = :courseId', {
          studentGithubId,
          courseId,
        })
        .getOne();

      if (student == null) {
        result.push({ status: 'skipped', value: `no student: ${studentGithubId}` });
        continue;
      }

      const existingResult = await taskResultsService.getTaskResult(student.id, data.courseTaskId);
      const user = ctx.state.user as IUserSession | null;
      const authorId = user?.id ?? 0;

      if (existingResult == null) {
        const taskResult = taskResultsService.createTaskResult(authorId, {
          ...data,
          studentId: Number(student.id),
        });
        const addResult = await getRepository(TaskResult).save(taskResult);
        result.push({ status: 'created', value: addResult.id });
        continue;
      }

      if (data.githubPrUrl) {
        existingResult.githubPrUrl = item.githubPrUrl || '';
      }
      if (data.comment) {
        existingResult.comment = item.comment;
      }
      if (data.score !== existingResult.score) {
        existingResult.historicalScores.push({
          authorId,
          score: data.score,
          dateTime: Date.now(),
          comment: item.comment,
        });
        existingResult.score = data.score;
      }

      const updateResult = await getRepository(TaskResult).save(existingResult);
      result.push({ status: 'updated', value: updateResult.id });
    } catch (e) {
      result.push({ status: 'failed', value: e.message });
    }
  }

  setResponse(ctx, OK, result);
};

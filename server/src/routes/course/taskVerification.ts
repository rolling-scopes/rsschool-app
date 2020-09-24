import { BAD_REQUEST, LOCKED, OK, TOO_MANY_REQUESTS, FORBIDDEN } from 'http-status-codes';
import Router from '@koa/router';
import { ILogger } from '../../logger';
import { awsTaskService, courseService, taskService, taskResultsService } from '../../services';
import { setResponse } from '../utils';
import { getRepository } from 'typeorm';
import { CourseTask, TaskVerification } from '../../models';

export const createTaskVerification = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId, courseTaskId } = ctx.params;

  const inputData: any = ctx.request.body;

  const [courseTask, student] = await Promise.all([
    taskService.getCourseTask(courseTaskId),
    courseService.getStudentByGithubId(courseId, githubId),
  ]);

  if (courseTask == null || student == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'No student or Not valid course task' });
    return;
  }

  const existing = await getRepository(TaskVerification)
    .createQueryBuilder('v')
    .select(['v.id'])
    .where("v.status = 'pending'")
    .andWhere('v.studentId = :studentId', { studentId: student.id })
    .andWhere('v.courseTaskId = :courseTaskId', { courseTaskId: courseTask.id })
    .andWhere("v.updatedDate > (NOW() - INTERVAL '1 hour')")
    .limit(1)
    .getOne();

  if (existing != null) {
    setResponse(ctx, TOO_MANY_REQUESTS, { id: existing });
    return;
  }

  const idCourseTaskExpired = await getRepository(CourseTask)
    .createQueryBuilder('v')
    .select(['v.id'])
    .where('v.id = :courseTaskId', { courseTaskId: courseTask.id })
    .andWhere('NOW() > v.studentEndDate')
    .limit(1)
    .getOne();

  if (idCourseTaskExpired != null) {
    setResponse(ctx, LOCKED, { id: idCourseTaskExpired, error: 'expired' });
    return;
  }

  if (courseTask.type === 'selfeducation') {
    await createSelfeducationVerification({
      ctx,
      courseTask,
      student: {
        id: student.id,
        answers: inputData,
      },
    });
  } else {
    const {
      identifiers: [identifier],
    } = await getRepository(TaskVerification).insert({
      studentId: student.id,
      courseTaskId: courseTask.id,
      score: 0,
      status: 'pending',
    });

    const result: VerificationEvent = {
      id: identifier.id,
      githubId,
      studentId: student.id,
      courseTask: {
        ...inputData,
        id: courseTask.id,
        type: courseTask.type || courseTask.task.type,
        attributes: courseTask.task.attributes ?? {},
      },
    };

    await awsTaskService.postTaskVerification([result]);

    setResponse(ctx, OK, result);
  }
};

const createSelfeducationVerification = async ({
  ctx,
  courseTask,
  student: { id: studentId, answers: studentAnswers },
}: SelfEducationVerificationParams) => {
  const {
    answers,
    public: { tresholdPercentage, maxAttemptsNumber, numberOfQuestions, strictAttemptsMode = true },
  } = courseTask.task.attributes as SelfEducationAttributes;
  const { id: courseTaskId, type: courseTaskType, maxScore } = courseTask;

  const verificationsNumber = (
    await getRepository(TaskVerification)
      .createQueryBuilder('v')
      .select(['v.id'])
      .andWhere('v.studentId = :studentId', { studentId })
      .andWhere('v.courseTaskId = :courseTaskId', { courseTaskId })
      .getMany()
  ).length;

  if (strictAttemptsMode && verificationsNumber >= maxAttemptsNumber) {
    setResponse(ctx, FORBIDDEN);
    return;
  }

  const rightAnswersCount = studentAnswers
    .map(({ index, value }) => {
      const rightAnswer = String(answers[index])
        .split(',')
        .sort((a, b) => Number(a) - Number(b))
        .join('');
      const userAnswer = String(value)
        .split(',')
        .sort((a, b) => Number(a) - Number(b))
        .join('');

      return Number(rightAnswer === userAnswer);
    })
    .reduce((sum, value) => sum + value, 0);

  const rightAnswersPercent = Math.round((100 / numberOfQuestions) * rightAnswersCount);
  let score = rightAnswersPercent < tresholdPercentage ? 0 : maxScore;
  let details = `Accuracy: ${rightAnswersPercent}%`;

  if (verificationsNumber >= maxAttemptsNumber) {
    score = score / 2;
    details += '. Attempts number was over, so score was divided by 2';
  }

  const {
    identifiers: [identifier],
  } = await getRepository(TaskVerification).insert({
    studentId,
    courseTaskId,
    score,
    details,
    status: 'completed',
  });

  const result = (await getRepository(TaskVerification).findOne(identifier.id))!;

  await taskResultsService.saveScore(result.studentId, result.courseTaskId, {
    authorId: 0,
    comment: result.details,
    score: result.score,
  });

  setResponse(ctx, OK, { ...result, courseTask: { type: courseTaskType } });
};

type VerificationEvent = {
  id: number;
  courseTask: {
    id: number;
    type: string;
    [key: string]: any;
  };
  studentId: number;
  githubId: string;
};

type SelfEducationVerificationParams = {
  ctx: Router.RouterContext;
  courseTask: CourseTask;
  student: {
    id: number;
    answers: {
      index: number;
      value: (number | number[])[];
    }[];
  };
};

type SelfEducationAttributes = {
  public: {
    maxAttemptsNumber: number;
    strictAttemptsMode?: boolean;
    numberOfQuestions: number;
    tresholdPercentage: number;
    questions: {
      question: string;
      answers: string[];
      multiple: boolean;
    }[];
  };
  answers: (number | number[])[];
};

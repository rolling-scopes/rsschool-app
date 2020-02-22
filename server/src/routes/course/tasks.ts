import Router from '@koa/router';
import { NOT_FOUND, OK } from 'http-status-codes';
import { CourseTask, TaskChecker, TaskResult, Task } from '../../models';
import { ILogger } from '../../logger';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';
import { shuffleService } from '../../services';

export const getCourseTasksDetails = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;

  const courseTasks = await getRepository(CourseTask)
    .createQueryBuilder('courseTask')
    .addSelect('COUNT(taskResult.id)', 'taskResultCount')
    .leftJoin(TaskResult, 'taskResult', '"taskResult"."courseTaskId" = "courseTask"."id"')
    .innerJoinAndSelect('courseTask.task', 'task')
    .leftJoin('courseTask.taskOwner', 'taskOwner')
    .addSelect(['taskOwner.githubId', 'taskOwner.id', 'taskOwner.firstName', 'taskOwner.lastName'])
    .where(`courseTask.courseId = :courseId`, { courseId })
    .addGroupBy('courseTask.id')
    .addGroupBy('task.id')
    .addGroupBy('taskOwner.id')
    .getRawAndEntities();

  const data = courseTasks.entities.map(item => {
    const raw = courseTasks.raw.find(t => t.courseTask_id === item.id);

    return {
      id: item.id,
      courseTaskId: item.id,
      taskId: (item.task as Task).id,
      name: (item.task as Task).name,
      maxScore: item.maxScore,
      scoreWeight: item.scoreWeight,
      stageId: item.stageId,
      githubPrRequired: !!(item.task as Task).githubPrRequired,
      verification: (item.task as Task).verification,
      description: (item.task as Task).description,
      descriptionUrl: (item.task as Task).descriptionUrl,
      studentStartDate: item.studentStartDate,
      studentEndDate: item.studentEndDate,
      taskResultCount: raw ? Number(raw.taskResultCount) : 0,
      allowStudentArtefacts: (item.task as Task).allowStudentArtefacts,
      useJury: (item.task as Task).useJury,
      checker: item.checker,
      taskOwner: item.taskOwner
        ? {
            id: item.taskOwner.id,
            githubId: item.taskOwner.githubId,
            name: `${item.taskOwner.firstName} ${item.taskOwner.lastName}`,
          }
        : null,
      taskCheckers: [],
      githubRepoName: (item.task as Task).githubRepoName,
      sourceGithubRepoUrl: (item.task as Task).sourceGithubRepoUrl,
      type: (item.task as Task).type,
    };
  });

  setResponse(ctx, OK, data);
};

export const getCourseTasks = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;

  const courseTasks = await getRepository(CourseTask)
    .createQueryBuilder('courseTask')
    .innerJoinAndSelect('courseTask.task', 'task')
    .where(`courseTask.courseId = :courseId`, { courseId })
    .getMany();

  const data = courseTasks.map(item => {
    return {
      id: item.id,
      taskId: (item.task as Task).id,
      name: (item.task as Task).name,
      maxScore: item.maxScore,
      scoreWeight: item.scoreWeight,
      githubPrRequired: !!(item.task as Task).githubPrRequired,
      verification: (item.task as Task).verification,
      descriptionUrl: (item.task as Task).descriptionUrl,
      studentStartDate: item.studentStartDate,
      studentEndDate: item.studentEndDate,
      useJury: (item.task as Task).useJury,
      checker: item.checker,
      taskOwnerId: item.taskOwnerId,
      githubRepoName: (item.task as Task).githubRepoName,
      sourceGithubRepoUrl: (item.task as Task).sourceGithubRepoUrl,
      type: (item.task as Task).type,
    };
  });

  setResponse(ctx, OK, data);
};

export const postCourseTaskDistribution = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseTaskId = Number(ctx.params.courseTaskId);
  const courseId = Number(ctx.params.courseId);
  const courseTaskRepository = getRepository(CourseTask);
  const checkerRepository = getRepository(TaskChecker);

  const courseTask = await courseTaskRepository.findOne({ where: { id: courseTaskId } });

  if (courseTask == null) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const studentsWithMentor = await shuffleService.shuffleCourseMentors(logger)(courseId);

  const studentWithChecker = studentsWithMentor
    .map((stm: any) =>
      stm.students.map((s: any) => ({
        courseTaskId,
        mentorId: stm.id,
        studentId: s.id,
      })),
    )
    .reduce((acc: any, v: any) => acc.concat(v), []);

  const bad = studentWithChecker.filter((s: any) => !s.mentor);
  logger.info(JSON.stringify(bad));

  await checkerRepository.delete({ courseTaskId });

  const result = await Promise.all(
    studentWithChecker.map(async (checker: Partial<TaskChecker>) => {
      return await checkerRepository.save({ ...checker });
    }),
  );

  setResponse(ctx, OK, result);
};

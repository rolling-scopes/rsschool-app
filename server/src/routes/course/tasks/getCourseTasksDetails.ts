import Router from '@koa/router';
import { OK } from 'http-status-codes';
import { getRepository } from 'typeorm';
import { ILogger } from '../../../logger';
import { CourseTask, Task, TaskResult, Student } from '../../../models';
import { setResponse } from '../../utils';

export const getCourseTasksDetails = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const userId: number = ctx.state.user.id;

  const student = await getRepository(Student)
    .createQueryBuilder('student')
    .innerJoin('student.user', 'user')
    .where('student."courseId" = :courseId', { courseId })
    .andWhere('"user"."id" = :userId', { userId })
    .getOne();

  const courseTasks = await getRepository(CourseTask)
    .createQueryBuilder('courseTask')
    .addSelect('COUNT(taskResult.id)', 'taskResultCount')
    .leftJoin(TaskResult, 'taskResult', '"taskResult"."courseTaskId" = "courseTask"."id"')
    .leftJoin(TaskResult, 'tr', '"tr"."courseTaskId" = "courseTask"."id" AND "tr"."studentId" = :studentId', {
      studentId: student?.id,
    })
    .addSelect('tr.score', 'score')
    .innerJoinAndSelect('courseTask.task', 'task')
    .leftJoin('courseTask.taskOwner', 'taskOwner')
    .addSelect(['taskOwner.githubId', 'taskOwner.id', 'taskOwner.firstName', 'taskOwner.lastName'])
    .where(`courseTask.courseId = :courseId`, { courseId })
    .andWhere('courseTask.disabled = :disabled', { disabled: false })
    .addGroupBy('courseTask.id')
    .addGroupBy('task.id')
    .addGroupBy('taskOwner.id')
    .addGroupBy('tr.score')
    .addGroupBy('tr.id')
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
      type: item.type || (item.task as Task).type,
      pairsCount: item.pairsCount,
      special: item.special,
      duration: item.duration,
      score: student && raw ? Number(raw.score) : null,
    };
  });

  setResponse(ctx, OK, data);
};

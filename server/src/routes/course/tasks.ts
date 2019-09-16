import Router from 'koa-router';
import { NOT_FOUND, OK } from 'http-status-codes';
import { Course, CourseTask, TaskChecker, TaskResult, Task, Stage } from '../../models';
import { ILogger } from '../../logger';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';
import { shuffleService } from '../../services';

export const getCourseTasks = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;

  const course = await getRepository(Course).findOne(courseId, {
    relations: ['stages', 'stages.courseTasks'],
  });

  if (course === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const courseTaskIds: number[] = course!.stages
    .reduce<CourseTask[]>((acc, stage) => acc.concat(stage.courseTasks || []), [])
    .map(task => task.id);

  if (courseTaskIds.length === 0) {
    setResponse(ctx, OK, []);
    return;
  }

  const courseTasks = await getRepository(CourseTask)
    .createQueryBuilder('courseTask')
    .addSelect('COUNT(taskResult.id)', 'taskResultCount')
    .leftJoin(TaskResult, 'taskResult', '"taskResult"."courseTaskId" = "courseTask"."id"')
    .innerJoinAndSelect('courseTask.task', 'task')
    .innerJoinAndSelect('courseTask.stage', 'stage')
    .where(`courseTask.id IN (${courseTaskIds.join(',')})`)
    .addGroupBy('courseTask.id')
    .addGroupBy('task.id')
    .addGroupBy('stage.id')
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
      stageId: (item.stage as Stage).id,
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
      taskCheckers: [],
      githubRepoName: (item.task as Task).githubRepoName,
    };
  });

  setResponse(ctx, OK, data);
};

export const getCourseTasksWithTaskCheckers = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;

  const course = await getRepository(Course).findOne(courseId, {
    relations: ['stages', 'stages.courseTasks'],
  });

  if (course === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const courseTaskIds: number[] = course!.stages
    .reduce<CourseTask[]>((acc, stage) => acc.concat(stage.courseTasks || []), [])
    .map(task => task.id);

  if (courseTaskIds.length === 0) {
    setResponse(ctx, OK, []);
    return;
  }

  const courseTasks = await getRepository(CourseTask)
    .createQueryBuilder('courseTask')
    .addSelect('COUNT(taskResult.id)', 'taskResultCount')
    .leftJoin(TaskResult, 'taskResult', '"taskResult"."courseTaskId" = "courseTask"."id"')
    .innerJoinAndSelect('courseTask.task', 'task')
    .innerJoinAndSelect('courseTask.stage', 'stage')
    .where(`courseTask.id IN (${courseTaskIds.join(',')})`)
    .addGroupBy('courseTask.id')
    .addGroupBy('task.id')
    .addGroupBy('stage.id')
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
      stageId: (item.stage as Stage).id,
      githubPrRequired: !!(item.task as Task).githubPrRequired,
      verification: (item.task as Task).verification,
      description: (item.task as Task).description,
      descriptionUrl: (item.task as Task).descriptionUrl,
      studentStartDate: item.studentStartDate,
      studentEndDate: item.studentEndDate,
      taskResultCount: raw ? Number(raw.taskResultCount) : 0,
      allowStudentArtefacts: (item.task as Task).allowStudentArtefacts,
      useJury: (item.task as Task).useJury,
      taskCheckers: [],
    };
  });

  const dataWithCheckers = await Promise.all(
    data.map(async d => {
      const taskCheckers = await getRepository(TaskChecker).find({
        where: { courseTaskId: d.courseTaskId },
        relations: ['student', 'student.user', 'mentor', 'mentor.user'],
      });

      return { ...d, taskCheckers };
    }),
  );

  setResponse(ctx, OK, dataWithCheckers);
};

export const postShuffleCourseTask = (logger: ILogger) => async (ctx: Router.RouterContext) => {
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
        mentor: stm.id,
        student: s.id,
      })),
    )
    .reduce((acc: any, v: any) => acc.concat(v), []);

  logger.info(JSON.stringify(studentWithChecker));

  await checkerRepository.delete({ courseTaskId });

  const result = await Promise.all(
    studentWithChecker.map(async (checker: Partial<TaskChecker>) => {
      return await checkerRepository.save({ ...checker });
    }),
  );

  setResponse(ctx, OK, result);
};

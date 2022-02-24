import { AbstractRepository, EntityRepository, getRepository } from 'typeorm';
import {
  CourseTask,
  TaskResult,
  Task,
  TaskInterviewResult,
  StageInterview,
  StageInterviewFeedback,
  Student,
} from '../models';

type Status = 'started' | 'inprogress' | 'finished';
@EntityRepository(CourseTask)
export class CourseTaskRepository extends AbstractRepository<CourseTask> {
  public async findWithDetails(courseId: number) {
    const courseTasks = await getRepository(CourseTask)
      .createQueryBuilder('ct')
      .addSelect('COUNT(tr.id)', 'taskResultCount')
      .addSelect('COUNT(tir.id)', 'taskInterviewResultCount')
      .innerJoinAndSelect('ct.task', 'task')
      .leftJoin(TaskResult, 'tr', 'tr.courseTaskId = ct.id')
      .leftJoin(TaskInterviewResult, 'tir', 'tir.courseTaskId = ct.id')
      .leftJoin('ct.taskOwner', 'to')
      .addSelect(['to.githubId', 'to.id', 'to.firstName', 'to.lastName'])
      .where(`ct.courseId = :courseId`, { courseId })
      .andWhere('ct.disabled = :disabled', { disabled: false })
      .groupBy('ct.id')
      .addGroupBy('task.id')
      .addGroupBy('to.id')
      .getRawAndEntities();

    const data = courseTasks.entities.map(item => {
      const raw = courseTasks.raw.find(t => t.ct_id === item.id);
      return {
        id: item.id,
        courseTaskId: item.id,
        taskId: (item.task as Task).id,
        name: (item.task as Task).name,
        maxScore: item.maxScore,
        scoreWeight: item.scoreWeight,
        githubPrRequired: !!(item.task as Task).githubPrRequired,
        description: (item.task as Task).description,
        descriptionUrl: (item.task as Task).descriptionUrl,
        studentStartDate: item.studentStartDate,
        studentEndDate: item.studentEndDate,
        resultsCount: raw ? Number(raw.taskResultCount) || Number(raw.taskInterviewResultCount) : 0,
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
      };
    });

    return data;
  }

  public async findForSchedule(courseId: number, userId: number) {
    const student = await getRepository(Student)
      .createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .where('student."courseId" = :courseId', { courseId })
      .andWhere('"user"."id" = :userId', { userId })
      .getOne();

    const studentId = student?.id ?? 0;
    const courseTasks = await getRepository(CourseTask)
      .createQueryBuilder('courseTask')
      .addSelect('COUNT(taskResult.id)', 'taskResultCount')
      .leftJoin(TaskResult, 'taskResult', '"taskResult"."courseTaskId" = "courseTask"."id"')
      .leftJoin(TaskInterviewResult, 'tir', 'tir.courseTaskId = courseTask.id AND "tir"."studentId" = :studentId', {
        studentId,
      })
      .leftJoin(TaskResult, 'tr', '"tr"."courseTaskId" = "courseTask"."id" AND "tr"."studentId" = :studentId', {
        studentId,
      })
      .leftJoin(StageInterview, 'si', '"si"."studentId" = :studentId AND "si"."courseTaskId" = "courseTask"."id"', {
        studentId,
      })
      .leftJoin(StageInterviewFeedback, 'sif', '"sif"."stageInterviewId" = "si"."id"')
      .addSelect(`COALESCE(tr.score, tir.score, ("sif"."json"::json -> 'resume' ->> 'score')::int)`, 'score')
      .innerJoinAndSelect('courseTask.task', 'task')
      .leftJoin('courseTask.taskOwner', 'taskOwner')
      .addSelect(['taskOwner.githubId', 'taskOwner.id', 'taskOwner.firstName', 'taskOwner.lastName'])
      .where(`courseTask.courseId = :courseId`, { courseId })
      .andWhere('courseTask.disabled = :disabled', { disabled: false })
      .addGroupBy('courseTask.id')
      .addGroupBy('task.id')
      .addGroupBy('taskOwner.id')
      .addGroupBy('tr.score')
      .addGroupBy('tir.score')
      .addGroupBy('tr.id')
      .addGroupBy('sif.json')
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
        githubPrRequired: !!(item.task as Task).githubPrRequired,
        description: (item.task as Task).description,
        descriptionUrl: (item.task as Task).descriptionUrl,
        studentStartDate: item.studentStartDate,
        studentEndDate: item.studentEndDate,
        resultsCount: raw ? Number(raw.taskResultCount) : 0,
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

    return data;
  }

  public async findByCourseId(courseId: number, status?: Status) {
    const now = new Date().toISOString();
    const courseTasksQuery = getRepository(CourseTask)
      .createQueryBuilder('courseTask')
      .innerJoinAndSelect('courseTask.task', 'task')
      .where(`courseTask.courseId = :courseId`, { courseId })
      .andWhere('courseTask.disabled = :disabled', { disabled: false })
      .orderBy('courseTask.studentEndDate', 'ASC');

    if (status === 'started') {
      courseTasksQuery.andWhere('courseTask.studentStartDate <= :now', { now });
    }

    if (status === 'inprogress') {
      courseTasksQuery.andWhere('courseTask.studentStartDate <= :now', { now });
      courseTasksQuery.andWhere('courseTask.studentEndDate > :now', { now });
    }

    if (status === 'finished') {
      courseTasksQuery.andWhere('courseTask.studentEndDate < :now', { now });
    }

    const courseTasks = await courseTasksQuery.getMany();

    const data = courseTasks.map(item => ({
      id: item.id,
      taskId: item.task.id,
      name: item.task.name,
      maxScore: item.maxScore,
      scoreWeight: item.scoreWeight,
      githubPrRequired: !!item.task.githubPrRequired,
      descriptionUrl: item.task.descriptionUrl,
      studentStartDate: item.studentStartDate,
      studentEndDate: item.studentEndDate,
      useJury: item.task.useJury,
      checker: item.checker,
      taskOwnerId: item.taskOwnerId,
      githubRepoName: item.task.githubRepoName,
      sourceGithubRepoUrl: item.task.sourceGithubRepoUrl,
      type: item.type || item.task.type,
      pairsCount: item.pairsCount,
      publicAttributes: item.task.attributes?.public,
      special: item.special,
      duration: item.duration,
    }));

    return data;
  }
}

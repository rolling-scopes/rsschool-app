import { OK } from 'http-status-codes';
import { parseAsync } from 'json2csv';
import Router from '@koa/router';
import { ILogger } from '../../logger';
import { courseService } from '../../services';
import { getCourseTasks, getEvents } from '../../services/course.service';
import { setCsvResponse, setResponse } from '../utils';

export const getStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);
  const status: string = ctx.query.status;
  const students = await courseService.getStudents(courseId, status === 'active');
  setResponse(ctx, OK, students);
};

export const getScheduleAsCsv = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);
  const courseTasks = await getCourseTasks(courseId);
  const courseEvents = await getEvents(courseId);

  const tasksToCsv = courseTasks.map(item => ({
    entityType: 'task',
    id: item.id,
    eventId: null,
    taskId: item.task.id,
    stageId: item.stageId,
    courseId: item.courseId,
    startDate: item.studentStartDate,
    endDate: item.studentEndDate,
    type: item.type || item.task.type,
    special: item.special,
    name: item.task.name,
    descriptionUrl: item.task.descriptionUrl,
    description: item.task.description,
    tags: item.task.tags,
    maxScore: item.maxScore,
    scoreWeight: item.scoreWeight,
    githubId: item.taskOwner ? item.taskOwner.githubId : null,
    place: null,
    comment: null,
    discipline: null,
    coordinator: null,
    detailsUrl: null,
    broadcastUrl: null,
    githubPrRequired: !!item.task.githubPrRequired,
    pairsCount: item.pairsCount,
    disabled: item.disabled,
    mentorStartDate: item.mentorStartDate,
    mentorEndDate: item.mentorEndDate,
    checker: item.checker,
    githubRepoName: item.task.githubRepoName,
    sourceGithubRepoUrl: item.task.sourceGithubRepoUrl,
    useJury: item.task.useJury,
    allowStudentArtefacts: item.task.allowStudentArtefacts,
    verification: item.task.verification,
  }));
  const eventsToCsv = courseEvents.map(item => ({
    entityType: 'event',
    id: item.id,
    eventId: item.eventId,
    stageId: item.stageId,
    courseId: item.courseId,
    startDate: item.dateTime,
    type: item.event.type,
    special: item.special,
    name: item.event.name,
    descriptionUrl: item.event.descriptionUrl,
    description: item.event.description,
    githubId: item.organizer ? item.organizer.githubId : null,
    discipline: item.event.discipline,
    coordinator: item.coordinator,
    detailsUrl: item.detailsUrl,
    broadcastUrl: item.broadcastUrl,
  }));

  const csv = await parseAsync([...tasksToCsv, ...eventsToCsv]);

  setCsvResponse(ctx, OK, csv, `schedule_${courseId}`);
};

import { OK } from 'http-status-codes';
import { parseAsync } from 'json2csv';
import Router from '@koa/router';
import { ILogger } from '../../logger';
import { getCourseTasks, getEvents } from '../../services/course.service';
import { setCsvResponse, setResponse } from '../utils';
import { getManager, getRepository, ObjectType, UpdateEvent } from 'typeorm';
import { Task, CourseTask, Event, CourseEvent } from '../../models';


export const getScheduleAsCsv = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);
  const courseTasks = await getCourseTasks(courseId);
  const courseEvents = await getEvents(courseId);

  const tasksToCsv = courseTasks.map(item => ({
    entityType: 'task',
    id: item.task.id,
    startDate: item.studentStartDate,
    endDate: item.studentEndDate,
    type: item.type || item.task.type,
    special: item.special,
    name: item.task.name,
    descriptionUrl: item.task.descriptionUrl,
    githubId: item.taskOwner ? item.taskOwner.githubId : null,
    place: null,
  }));
  const eventsToCsv = courseEvents.map(item => ({
    entityType: 'event',
    id: item.eventId,
    startDate: item.dateTime,
    type: item.event.type,
    special: item.special,
    name: item.event.name,
    descriptionUrl: item.event.descriptionUrl,
    githubId: item.organizer ? item.organizer.githubId : null,
    place: item.place,
  }));

  const csv = await parseAsync([...tasksToCsv, ...eventsToCsv]);

  setCsvResponse(ctx, OK, csv, `schedule_${courseId}`);
};

export const setScheduleFromCsv = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);
  const data = ctx.request.body;
  
  const isOldTasks = (entity: any) => entity.entityType === 'task' && entity.id;
  const isNewTasks = (entity: any) => entity.entityType === 'task' && !entity.id;
  const isOldEvents = (entity: any) => entity.entityType === 'event' && entity.id;
  const isNewEvents = (entity: any) => entity.entityType === 'event' && !entity.id;

  // we make 100500 requests in parallel and process them. But it's better to do it all in one transaction.
  const result = await Promise.allSettled(data.map(async (entity: any) => {
    if (isOldTasks(entity)) {
      const response1 = await getRepository(Task).update(entity.id, entity);
      const response2 = await getRepository(CourseTask).update(entity.id, entity);
      return { response1, response2, status: 'OK' };
    }
    if (isNewTasks(entity)) {
      const response1 = await getRepository(Task).insert(entity);
      const response2 = await getRepository(CourseTask).insert(entity);
      return { response1, response2, status: 'OK' };
    }
    if (isOldEvents(entity)) {
      const response1 = await getRepository(Event).update(entity.id, entity);
      const response2 = await getRepository(CourseEvent).update(entity.id, entity);
      return { response1, response2, status: 'OK' };
    }
    if (isNewEvents(entity)) {
      const response1 = await getRepository(Event).insert(entity);
      const response2 = await getRepository(CourseEvent).insert(entity);
      return { response1, response2, status: 'OK' };
    }
  }));

  setResponse(ctx, OK, result);
};

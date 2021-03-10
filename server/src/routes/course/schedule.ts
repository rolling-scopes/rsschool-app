import { OK } from 'http-status-codes';
import { parseAsync } from 'json2csv';
import Router from '@koa/router';
import { ILogger } from '../../logger';
import { getCourseTasks, getEvents } from '../../services/course.service';
import { setCsvResponse, setResponse } from '../utils';
import { getRepository } from 'typeorm';
import { Task, CourseTask, Event, CourseEvent } from '../../models';
import { getConnection } from 'typeorm';

type EntityFromCSV = {
  entityType: 'task' | 'event';
  templateId: number;
  id: number;
  startDate: string;
  endDate: string;
  type: string;
  special: string;
  name: string;
  descriptionUrl: string;
  githubId: string | null;
  place: string | null;
};

export const getScheduleAsCsv = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);
  const courseTasks = await getCourseTasks(courseId);
  const courseEvents = await getEvents(courseId);

  const tasksToCsv = courseTasks.map(item => ({
    entityType: 'task',
    templateId: item.id,
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
    templateId: item.id,
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

export const setScheduleFromCsv = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  // const courseId = Number(ctx.params.courseId);
  const data = ctx.request.body as EntityFromCSV[];

  const tasksToUpdate = data.filter((entity: EntityFromCSV) => entity.entityType === 'task' && entity.id);
  const eventsToUpdate = data.filter((entity: EntityFromCSV) => entity.entityType === 'event' && entity.id);

  const queryRunner = getConnection().createQueryRunner();
  let response = 'Import CSV file successfully finished.';

  await queryRunner.startTransaction();
  try {
    await updateTasks(tasksToUpdate);
    await updateEvents(eventsToUpdate);
    await queryRunner.commitTransaction();
  } catch (err) {
    logger.error(err.message);
    response = err.message;
    await queryRunner.rollbackTransaction();
    return;
  } finally {
    await queryRunner.release();
    setResponse(ctx, OK, response);
  }
};

const updateTasks = async (tasks: EntityFromCSV[]) => {
  for await (const task of tasks) {
    const taskData = {
      name: task.name,
      type: task.type,
      descriptionUrl: task.descriptionUrl || '',
    } as Partial<Task>;

    const courseTaskData = {
      studentStartDate: task.startDate || null,
      studentEndDate: task.endDate || null,
      special: task.special,
      // taskOwnerId: task.githubId || null,
    } as Partial<CourseTask>;

    await getRepository(Task).update(task.templateId, taskData);
    await getRepository(CourseTask).update(task.id, courseTaskData);
  }
};

const updateEvents = async (events: EntityFromCSV[]) => {
  for await (const event of events) {
    const eventData = {
      name: event.name,
      type: event.type,
      descriptionUrl: event.descriptionUrl || '',
    } as Partial<Event>;

    const courseEventData = {
      dateTime: event.startDate || null,
      special: event.special,
      // organizer: event.githubId || null,
      place: event.place || null,
    } as Partial<CourseEvent>;

    await getRepository(Event).update(event.templateId, eventData);
    await getRepository(CourseEvent).update(event.id, courseEventData);
  }
};

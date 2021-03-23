import { OK } from 'http-status-codes';
import { parseAsync } from 'json2csv';
import Router from '@koa/router';
import { ILogger } from '../../logger';
import { getCourseTasks, getEvents } from '../../services/course.service';
import { getUserByGithubId } from '../../services/user.service';
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
  const courseId = Number(ctx.params.courseId);
  const data = ctx.request.body as EntityFromCSV[];

  const tasks = data.filter((entity: EntityFromCSV) => entity.entityType === 'task');
  const events = data.filter((entity: EntityFromCSV) => entity.entityType === 'event');

  const queryRunner = getConnection().createQueryRunner();
  let response = 'Import CSV file successfully finished.';

  await queryRunner.startTransaction();
  try {
    await saveTasks(tasks, courseId);
    await saveEvents(events, courseId);
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

const saveTasks = async (tasks: EntityFromCSV[], courseId: number) => {
  for await (const task of tasks) {
    const taskData = {
      name: task.name,
      type: task.type,
      descriptionUrl: task.descriptionUrl || '',
    } as Partial<Task>;

    const user = task.githubId ? await getUserByGithubId(task.githubId) : null;

    const courseTaskData = {
      courseId,
      taskId: task.templateId,
      studentStartDate: task.startDate || null,
      studentEndDate: task.endDate || null,
      special: task.special,
      taskOwner: user,
      taskOwnerId: user ? user.id : null,
    } as Partial<CourseTask>;

    if (task.templateId) {
      await getRepository(Task).update(task.templateId, taskData);
      await getRepository(CourseTask).update(task.id, courseTaskData);
    } else {
      const { id } = await getRepository(Task).save(taskData);

      if (!id) {
        throw new Error('Creating new task failed.');
      }

      await getRepository(CourseTask).save({ ...courseTaskData, taskId: id });
    }
  }
};

const saveEvents = async (events: EntityFromCSV[], courseId: number) => {
  for await (const event of events) {
    const eventData = {
      name: event.name,
      type: event.type,
      descriptionUrl: event.descriptionUrl || '',
    } as Partial<Event>;

    const user = event.githubId ? await getUserByGithubId(event.githubId) : null;

    const courseEventData = {
      courseId,
      eventId: event.templateId,
      dateTime: event.startDate || null,
      special: event.special,
      organizer: user,
      organizerId: user ? user.id : null,
      place: event.place || null,
    } as Partial<CourseEvent>;

    if (event.templateId) {
      await getRepository(Event).update(event.templateId, eventData);
      await getRepository(CourseEvent).update(event.id, courseEventData);
    } else {
      const { id } = await getRepository(Event).save(eventData);

      if (!id) {
        throw new Error('Creating new event failed.');
      }

      await getRepository(CourseEvent).save({ ...courseEventData, eventId: id });
    }
  }
};

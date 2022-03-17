import { getRepository, getConnection } from 'typeorm';
import { OK } from 'http-status-codes';
import { parseAsync } from 'json2csv';
import Router from '@koa/router';
import moment from 'moment-timezone';
import { Task, CourseTask, Event, CourseEvent } from '../../models';
import { ILogger } from '../../logger';
import { getCourseTasksWithOwner, getEvents } from '../../services/course.service';
import { getUserByGithubId } from '../../services/user.service';
import { setCsvResponse, setResponse, dateFormatter } from '../utils';

const DEFAULT_TIMEZONE = 'Europe/Minsk';

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
  checker: 'auto-test' | 'mentor' | 'assigned' | 'taskOwner' | 'crossCheck' | null;
  pairsCount: number | null;
};

export const getScheduleAsCsv = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);
  const timeZone = ctx.params.timeZone ? ctx.params.timeZone.replace('_', '/') : DEFAULT_TIMEZONE;
  const courseTasks = await getCourseTasksWithOwner(courseId);
  const courseEvents = await getEvents(courseId);

  const tasksToCsv = courseTasks.map(item => ({
    entityType: 'task',
    templateId: item.taskId,
    id: item.id,
    startDate: dateFormatter(item.studentStartDate as string, timeZone, 'YYYY-MM-DD HH:mm'),
    endDate: dateFormatter(item.studentEndDate as string, timeZone, 'YYYY-MM-DD HH:mm'),
    type: item.type || item.task.type,
    special: item.special,
    name: item.task.name,
    descriptionUrl: item.task.descriptionUrl,
    githubId: item.taskOwner ? item.taskOwner.githubId : null,
    place: null,
    checker: item.checker,
    pairsCount: item.pairsCount,
  }));
  const eventsToCsv = courseEvents.map(item => ({
    entityType: 'event',
    templateId: item.eventId,
    id: item.id,
    startDate: dateFormatter(item.dateTime, timeZone, 'YYYY-MM-DD HH:mm'),
    type: item.event.type,
    special: item.special,
    name: item.event.name,
    descriptionUrl: item.event.descriptionUrl,
    githubId: item.organizer ? item.organizer.githubId : null,
    place: item.place,
    checker: null,
    pairsCount: null,
  }));

  const csv = await parseAsync(
    [...tasksToCsv, ...eventsToCsv].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
  );

  setCsvResponse(ctx, OK, csv, `schedule_${courseId}`);
};

export const setScheduleFromCsv = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);
  const timeZone = ctx.params.timeZone ? ctx.params.timeZone.replace('_', '/') : DEFAULT_TIMEZONE;
  const data = ctx.request.body as EntityFromCSV[];

  const tasks = data.filter((entity: EntityFromCSV) => entity.entityType === 'task');
  const events = data.filter((entity: EntityFromCSV) => entity.entityType === 'event');
  const queryRunner = getConnection().createQueryRunner();
  let response = 'Import CSV file successfully finished.';

  await queryRunner.startTransaction();
  try {
    await saveTasks(tasks, courseId, timeZone);
    await saveEvents(events, courseId, timeZone);
    await queryRunner.commitTransaction();
  } catch (err) {
    const error = err as Error;
    logger.error(error.message);
    response = error.message;
    await queryRunner.rollbackTransaction();
    return;
  } finally {
    await queryRunner.release();
    setResponse(ctx, OK, response);
  }
};

const saveTasks = async (tasks: EntityFromCSV[], courseId: number, timeZone: string) => {
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
      studentStartDate: moment(task.startDate).tz(timeZone).toISOString() || null,
      studentEndDate: moment(task.endDate).tz(timeZone).toISOString() || null,
      special: task.special,
      taskOwner: user,
      checker: task.checker,
      pairsCount: task.pairsCount || null,
    } as Partial<CourseTask>;

    // update task & courseTask
    if (task.templateId && task.id) {
      await getRepository(Task).update({ id: task.templateId }, taskData);
      await getRepository(CourseTask).update({ id: task.id }, courseTaskData);
    }

    // create new courseTask
    if (task.templateId && !task.id) {
      await getRepository(Task).update({ id: task.templateId }, taskData);
      const { id } = await getRepository(CourseTask).save(courseTaskData);

      if (!id) {
        throw new Error('Creating new course task failed.');
      }
    }

    //create task & courseTask
    if (!task.templateId) {
      const { id } = await getRepository(Task).save(taskData);

      if (!id) {
        throw new Error('Creating new task failed.');
      }

      const { id: courseId } = await getRepository(CourseTask).save({ ...courseTaskData, taskId: id });

      if (!courseId) {
        throw new Error('Creating new course task failed.');
      }
    }
  }
};

const saveEvents = async (events: EntityFromCSV[], courseId: number, timeZone: string) => {
  for await (const event of events) {
    const eventData: Partial<Event> = {
      name: event.name,
      type: event.type,
      descriptionUrl: event.descriptionUrl || '',
    };

    const user = event.githubId ? await getUserByGithubId(event.githubId) : null;

    const courseEventData = {
      courseId,
      eventId: event.templateId,
      dateTime: moment(event.startDate).tz(timeZone).toISOString() || null,
      special: event.special,
      organizer: user,
      place: event.place || null,
    } as Partial<CourseEvent>;

    // update event & courseEvent
    if (event.templateId && event.id) {
      await getRepository(Event).update({ id: event.templateId }, eventData);
      await getRepository(CourseEvent).update({ id: event.id }, courseEventData);
    }

    // create new courseEvent
    if (event.templateId && !event.id) {
      await getRepository(Event).update({ id: event.templateId }, eventData);
      const { id } = await getRepository(CourseEvent).save(courseEventData);

      if (!id) {
        throw new Error('Creating new course event failed.');
      }
    }

    //create event & courseEvent
    if (!event.templateId) {
      const { id } = await getRepository(Event).save(eventData);

      if (!id) {
        throw new Error('Creating new event failed.');
      }

      const { id: courseId } = await getRepository(CourseEvent).save({ ...courseEventData, eventId: id });

      if (!courseId) {
        throw new Error('Creating new course event failed.');
      }
    }
  }
};

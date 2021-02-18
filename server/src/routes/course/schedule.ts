import { OK } from 'http-status-codes';
import { parseAsync } from 'json2csv';
import Router from '@koa/router';
import { ILogger } from '../../logger';
import { getCourseTasks, getEvents } from '../../services/course.service';
import { setCsvResponse, setResponse } from '../utils';
import { getManager, getRepository, ObjectType, UpdateEvent } from 'typeorm';
import { Task, CourseTask, Event, CourseEvent } from '../../models';
import { getConnection } from 'typeorm';

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

  const saveCsvToDatabase = async (data: any, courseId: number) => {
    const rawOldTasks = data.filter((entity: any) => entity.entityType === 'task' && entity.id);
    const rawNewTasks = data.filter((entity: any) => entity.entityType === 'task' && !entity.id);
    const rawOldEvents = data.filter((entity: any) => entity.entityType === 'event' && entity.id);
    const rawNewEvents = data.filter((entity: any) => entity.entityType === 'event' && !entity.id);
    console.log(data.length);
    console.log('!!!!',rawOldTasks, rawNewTasks, rawOldEvents, rawNewEvents);
    // preparation of data for sending to DB
    const oldTasksForTaskRepository = rawNewTasks.map((entity: any) => ({
      name: entity.name,
      descriptionUrl: entity.descriptionUrl,
    }));

    const oldldTasksForCourseTaskRepository = rawNewTasks.map((entity: any) => ({
      name: entity.name,
      descriptionUrl: entity.descriptionUrl,
    }));

    const newTasksForTaskRepository = rawOldTasks.map((entity: any) => ({}));
    const newTasksForCourseTaskRepository = rawOldTasks.map((entity: any) => ({}));

    const oOldEventsForEventRepository = rawNewEvents.map((entity: any) => ({}));
    const oldEventsForCourseEventRepository = rawNewEvents.map((entity: any) => ({}));

    const newEventsForTaskRepository = rawOldEvents.map((entity: any) => ({}));
    const newEventsForCourseTaskRepository = rawOldEvents.map((entity: any) => ({}));

    // sending data to DB // const recordOldTasksForTaskRepository = oldTasksForTaskRepository.map((entity: any) => getRepository(Task).update(entity.id, entity));

    // oldTasks
    const recordOldTasksForTaskRepository = oldTasksForTaskRepository.map((entity: any) => ({}));
    const recordOldTasksForCourseTaskRepository = oldldTasksForCourseTaskRepository.map((entity: any) => ({}));

    // newTasks
    const recordNewTasksForTaskRepository = newTasksForTaskRepository.map((entity: any) => ({}));
    const recordNewTasksForCourseTaskRepository = newTasksForCourseTaskRepository.map((entity: any) => ({}));
    // oldEvents
    const recordOldEventsForEventRepository = oOldEventsForEventRepository.map((entity: any) => ({}));
    const recordOldEventsForCourseEventRepository = oldEventsForCourseEventRepository.map((entity: any) => ({}));
    // newEvents
    const recordNewEventsForTaskRepository = newEventsForTaskRepository.map((entity: any) => ({}));
    const recordNewEventsForCourseTaskRepository = newEventsForCourseTaskRepository.map((entity: any) => ({}));

    console.log({
      recordOldTasksForTaskRepository,
      recordOldTasksForCourseTaskRepository,
      recordNewTasksForTaskRepository,
      recordNewTasksForCourseTaskRepository,
      recordOldEventsForEventRepository,
      recordOldEventsForCourseEventRepository,
      recordNewEventsForTaskRepository,
      recordNewEventsForCourseTaskRepository,
    });

    return {
      recordOldTasksForTaskRepository,
      recordOldTasksForCourseTaskRepository,
      recordNewTasksForTaskRepository,
      recordNewTasksForCourseTaskRepository,
      recordOldEventsForEventRepository,
      recordOldEventsForCourseEventRepository,
      recordNewEventsForTaskRepository,
      recordNewEventsForCourseTaskRepository,
    };
  };

  const queryRunner = getConnection().createQueryRunner();
  let response = null;

  await queryRunner.startTransaction();
  try {
    response = saveCsvToDatabase(data, courseId);
    await queryRunner.commitTransaction();
  } catch (err) {
    response = err;
    await queryRunner.rollbackTransaction();
    return;
  } finally {
    await queryRunner.release();
    setResponse(ctx, OK, response);
  }
};

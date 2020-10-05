// tslint:disable-next-line
const ics = require('ics');
import { OK } from 'http-status-codes';
import Router from '@koa/router';
import { DateTime } from 'luxon';
import { ILogger } from '../../logger';
import { CourseEvent } from '../../models';
import { courseService } from '../../services';
import { setIcalResponse, setResponse } from '../utils';

export const getCourseEvents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const data = await courseService.getEvents(courseId);

  setResponse(ctx, OK, data);
};

export const getCourseEventsCalendar = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const data = await courseService.getEvents(courseId);

  const iCalString = await createICalEvents(data);
  setIcalResponse(ctx, iCalString);
};

async function createICalEvents(data: CourseEvent[]) {
  return new Promise<string>((resolve, reject) => {
    const { value, error } = ics.createEvents(
      data.map(d => {
        const date = DateTime.fromISO(`${d.dateTime}`).toUTC();
        return {
          uid: `${d.id}.event.course@app.rs.school`,
          title: d.event.name,
          description: [
            `Type: ${d.event.type}`,
            d.event.descriptionUrl ? `Description: ${d.event.descriptionUrl}` : '',
            d.organizer
              ? `Organizer: ${d.organizer.firstName} ${d.organizer.lastName} https://github.com/${d.organizer.githubId}`
              : '',
          ].join('\n'),
          location: d.broadcastUrl || d.place,
          startInputType: 'utc',
          start: [date.year, date.month, date.day, date.hour, date.minute],
          duration: { minutes: 60 },
          categories: [d.event.type],
        };
      }),
    );
    if (error) {
      reject(error);
      return;
    }
    resolve(value);
  });
}

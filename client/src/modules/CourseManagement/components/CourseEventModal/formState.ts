import { message } from 'antd';
import { CreateCourseEventDto, EventDto } from 'api';
import { omit } from 'lodash';
import moment from 'moment';
import { CourseEvent, CourseService } from 'services/course';
import { Event, EventService } from 'services/event';
import { formatTimezoneToUTC } from 'services/formatter';

const eventService = new EventService();

const createRecord = (eventTemplateId: number, values: any): CreateCourseEventDto => {
  const record = {
    eventId: eventTemplateId,
    special: values.special ? values.special.join(',') : '',
    dateTime: values.dateTime ? formatTimezoneToUTC(values.dateTime, values.timeZone) : undefined,
    endTime: values.endTime ? formatTimezoneToUTC(values.endTime, values.timeZone) : undefined,
    place: values.place || null,
    organizer: values.organizerId ? { id: values.organizerId } : undefined,
  };
  return record;
};

const submitTemplateEvent = async (values: any, eventTemplate?: EventDto) => {
  const templateEventData = {
    name: eventTemplate ? eventTemplate?.name : values.event,
    type: values.type,
    descriptionUrl: values.descriptionUrl,
    description: values.description,
  } as Partial<Event>;

  if (!eventTemplate) {
    try {
      const res = await eventService.createEvent(templateEventData);
      return res.id;
    } catch (error) {
      message.error('Failed to create event template. Please try later.');
    }
  } else {
    try {
      await eventService.updateEvent(eventTemplate.id, templateEventData);
      return eventTemplate.id;
    } catch (error) {
      message.error('Failed to update event template. Please try later.');
    }
  }
};

export async function submitEvent(
  values: any,
  eventTemplates: EventDto[],
  courseId: number,
  editableRecord?: Partial<CourseEvent>,
): Promise<void> {
  const currentEventTemplate = editableRecord?.event ?? eventTemplates.find(el => el.id === +values.event);
  const eventTemplateId = await submitTemplateEvent(values, currentEventTemplate as EventDto);
  if (!eventTemplateId) return;
  const serviceCourse = new CourseService(courseId);
  const record = createRecord(eventTemplateId, values);
  if (editableRecord?.id) {
    try {
      await serviceCourse.updateCourseEvent(editableRecord.id, omit(record, 'eventId'));
    } catch (error) {
      message.error('Failed to update event. Please try later.');
    }
  } else {
    try {
      await serviceCourse.createCourseEvent(record);
    } catch (error) {
      message.error('Failed to create event. Please try later.');
    }
  }
}

export function getInitialValues(modalData: Partial<CourseEvent>) {
  const timeZone = 'UTC';
  return {
    ...modalData,
    type: modalData.event?.type,
    descriptionUrl: modalData.event?.descriptionUrl ? modalData.event.descriptionUrl : '',
    description: modalData.event?.description ? modalData.event.description : '',
    dateTime: modalData.dateTime ? moment.tz(modalData.dateTime, timeZone) : null,
    endTime: modalData.endTime ? moment.tz(modalData.endTime, timeZone) : null,
    organizerId: modalData.organizer ? modalData.organizer.id : undefined,
    special: modalData.special ? modalData.special.split(',') : [],
    timeZone,
  };
}

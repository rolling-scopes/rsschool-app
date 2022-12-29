import { message } from 'antd';
import { CreateCourseEventDto, CreateEventDto, EventDto, EventsApi } from 'api';
import { EVENT_TYPES } from 'data/eventTypes';
import { omit } from 'lodash';
import moment from 'moment';
import { CourseEvent, CourseService } from 'services/course';
import { formatTimezoneToUTC } from 'services/formatter';

const eventsApi = new EventsApi();

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
    disciplineId: values.disciplineId,
  } as CreateEventDto;

  if (!eventTemplate) {
    try {
      const res = await eventsApi.createEvent(templateEventData);
      return res.data.id;
    } catch (error) {
      message.error('Failed to create event template. Please try later.');
    }
  } else {
    try {
      const res = await eventsApi.updateEvent(eventTemplate.id, templateEventData);
      return res.data.id;
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
    type: EVENT_TYPES.find(event => event.id === modalData.event?.type)?.id ?? null,
    descriptionUrl: modalData.event?.descriptionUrl ? modalData.event.descriptionUrl : '',
    description: modalData.event?.description ? modalData.event.description : '',
    dateTime: modalData.dateTime ? moment.tz(modalData.dateTime, timeZone) : null,
    endTime: modalData.endTime ? moment.tz(modalData.endTime, timeZone) : null,
    organizerId: modalData.organizer ? modalData.organizer.id : undefined,
    special: modalData.special ? modalData.special.split(',') : [],
    timeZone,
  };
}

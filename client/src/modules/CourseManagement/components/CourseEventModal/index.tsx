import { Col, DatePicker, Form, Input, message, Row, Select } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { CourseEventDto, CreateCourseEventDto } from 'api';
import { ModalForm } from 'components/Forms';
import { UserSearch } from 'components/UserSearch';
import { TIMEZONES } from 'configs/timezones';
import { EVENT_TYPES } from 'data/eventTypes';
import { SPECIAL_ENTITY_TAGS } from 'modules/Schedule/constants';
import { useCallback } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { Event, EventService } from 'services/event';
import { formatTimezoneToUTC } from 'services/formatter';
import { UserService } from 'services/user';
import { urlPattern } from 'services/validators';

const { Option } = Select;

type Props = {
  data: Partial<CourseEventDto> | null;
  onCancel: () => void;
  courseId: number;
};

const eventService = new EventService();
const userService = new UserService();

export function CourseEventModal({ data, onCancel, courseId }: Props) {
  const [form] = Form.useForm();

  const loadUsers = (searchText: string) => {
    return userService.searchUser(searchText);
  };

  const { loading, value: events = [] } = useAsync(() => eventService.getEvents(), []);

  const filterOption = useCallback(
    (input, option) => {
      if (!input) {
        return false;
      }
      const event: Event | undefined = events.find(e => e.id === option?.value);
      return event?.name.toLowerCase().includes(input.toLowerCase()) ?? false;
    },
    [events],
  );

  const handleModalSubmit = async (values: any) => {
    submitEvent(values, events, false, courseId);
  };

  const typesList = EVENT_TYPES;
  const entityTypes = typesList.map(tag => {
    return (
      <Option key={tag.id} value={tag.id}>
        {tag.name}
      </Option>
    );
  });

  return (
    <ModalForm
      form={form}
      loading={loading}
      data={data}
      title="Course Event"
      submit={handleModalSubmit}
      cancel={onCancel}
    >
      <Form.Item name="event" label="Event" rules={[{ required: true, message: 'Please select a event' }]}>
        <Select
          maxTagCount={1}
          mode="tags"
          filterOption={filterOption}
          showSearch
          placeholder="Please select a event"
          onChange={value => {
            const [currentEvent] = value;
            form.setFieldValue('event', currentEvent);
            const currentTemplateEvent = events.find(el => el.id === +currentEvent && el.name !== currentEvent);
            form.setFieldValue('description', currentTemplateEvent?.description);
            form.setFieldValue('descriptionUrl', currentTemplateEvent?.descriptionUrl);
          }}
        >
          {events.map((event: Event) => (
            <Option key={event.id}>{event.name}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="type" label="Type" rules={[{ required: true }]}>
        <Select>{entityTypes}</Select>
      </Form.Item>
      <Form.Item name="special" label="Special">
        <Select mode="tags" style={{ minWidth: 100 }} tokenSeparators={[',']} allowClear>
          {SPECIAL_ENTITY_TAGS.map((tag: string) => (
            <Option key={tag} value={tag}>
              {tag}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="timeZone" label="TimeZone" rules={[{ required: true, message: 'Please select a time zone' }]}>
        <Select placeholder="Please select a timezone">
          {TIMEZONES.map(tz => (
            <Option key={tz} value={tz}>
              {/* there is no 'Europe / Kyiv' time zone at the moment */}
              {tz === 'Europe/Kiev' ? 'Europe/Kyiv' : tz}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name="dateTime"
            label="Date and Time"
            rules={[{ required: true, message: 'Please enter date and time' }]}
          >
            <DatePicker format="YYYY-MM-DD HH:mm" showTime={{ format: 'HH:mm' }} />
          </Form.Item>
        </Col>
        <Form.Item name="endTime" label="End Date and Time">
          <DatePicker format="YYYY-MM-DD HH:mm" showTime={{ format: 'HH:mm' }} />
        </Form.Item>
        <Col span={12}></Col>
      </Row>

      <Form.Item
        name="descriptionUrl"
        label="Description URL"
        rules={[
          {
            required: true,
            message: 'Please enter description URL',
          },
          {
            message: 'Please enter valid URL',
            pattern: urlPattern,
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item name={['taskOwner', 'id']} label="Task Owner">
        <UserSearch
          placeholder="Please select a task owner"
          defaultValues={data?.organizer ? [data.organizer] : []}
          searchFn={loadUsers}
        />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <TextArea />
      </Form.Item>

      <Form.Item name="place" label="Place">
        <Input style={{ minWidth: 250 }} />
      </Form.Item>
    </ModalForm>
  );
}

const submitTemplateEvent = async (values: any, eventTemplates: Event[]) => {
  const currentTemplateEvent = eventTemplates.find(el => el.id === +values.event[0] && el.name !== values.event[0]);
  const templateEventData = {
    name: currentTemplateEvent ? currentTemplateEvent.name : values.event[0],
    type: values.type,
    descriptionUrl: values.descriptionUrl,
    description: values.description,
  } as Partial<Event>;

  if (!currentTemplateEvent) {
    try {
      const res = await eventService.createEvent(templateEventData);
      return res.id;
    } catch (error) {
      message.error('Failed to create event template. Please try later.');
    }
  } else {
    try {
      await eventService.updateEvent(currentTemplateEvent.id, templateEventData);
      return currentTemplateEvent.id;
    } catch (error) {
      message.error('Failed to update event template. Please try later.');
    }
  }
};

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

async function submitEvent(
  values: Event,
  eventTemplates: Event[],
  isUpdateMode: boolean,
  courseId: number,
): Promise<void> {
  const eventTemplateId = await submitTemplateEvent(values, eventTemplates);
  if (!eventTemplateId) return;
  const serviceCourse = new CourseService(courseId);
  const record = createRecord(eventTemplateId, values);
  if (isUpdateMode) {
    return;
  } else {
    await serviceCourse.createCourseEvent(record);
  }
}

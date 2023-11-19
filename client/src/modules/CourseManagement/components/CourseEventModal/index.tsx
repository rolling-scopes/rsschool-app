import { Col, DatePicker, Form, Input, Row, Select, Typography } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { DisciplinesApi, EventsApi } from 'api';
import { ModalForm } from 'components/Forms';
import { UserSearch } from 'components/UserSearch';
import { TIMEZONES } from 'configs/timezones';
import { EVENT_TYPES } from 'data/eventTypes';
import { SPECIAL_ENTITY_TAGS } from 'modules/Schedule/constants';
import { useCallback } from 'react';
import { useAsync } from 'react-use';
import { CourseEvent } from 'services/course';
import { UserService } from 'services/user';
import { urlPattern } from 'services/validators';
import { getInitialValues, submitEvent } from './formState';

const { Option } = Select;
const { Title } = Typography;

type Props = {
  data: Partial<CourseEvent>;
  onCancel: () => void;
  onSubmit: () => void;
  courseId: number;
};

const eventsApi = new EventsApi();
const disciplineApi = new DisciplinesApi();
const userService = new UserService();

export function CourseEventModal({ data, onCancel, courseId, onSubmit }: Props) {
  const [form] = Form.useForm();

  const loadUsers = (searchText: string) => {
    return userService.searchUser(searchText);
  };

  const loadData = async () => {
    const [{ data: events = [] }, { data: disciplines = [] }] = await Promise.all([
      eventsApi.getEvents(),
      disciplineApi.getDisciplines(),
    ]);
    return {
      events,
      disciplines,
    };
  };

  const { loading, value: { events = [], disciplines = [] } = {} } = useAsync(loadData, []);
  const filterOption = useCallback(
    (input: string, option?: { value: string }): boolean => {
      if (!input) {
        return false;
      }
      const event = events.find(e => e.id === Number(option?.value));
      return event?.name.toLowerCase().includes(input.toLowerCase()) ?? false;
    },
    [events],
  );

  const handleModalSubmit = async (values: any) => {
    await submitEvent(values, events, courseId, data);
    onSubmit();
  };

  const typesList = EVENT_TYPES;
  const entityTypes = typesList.map(tag => {
    return (
      <Option key={tag.id} value={tag.id}>
        {tag.name}
      </Option>
    );
  });

  const onEventChange = (value: any) => {
    const currentEvent = value.at(-1);
    form.setFieldValue('event', currentEvent);
    const currentEventTemplate = events.find(el => el.id === +currentEvent && el.name !== currentEvent);
    form.setFieldValue('description', currentEventTemplate?.description);
    form.setFieldValue('descriptionUrl', currentEventTemplate?.descriptionUrl);
    form.setFieldValue('type', currentEventTemplate?.type);
  };

  return (
    <ModalForm
      form={form}
      loading={loading}
      getInitialValues={getInitialValues}
      data={data}
      title="Course Event"
      submit={handleModalSubmit}
      cancel={onCancel}
    >
      {data.event?.id ? (
        <Title level={4}>{data.event.name}</Title>
      ) : (
        <Form.Item name="event" label="Event" rules={[{ required: true, message: 'Please select an event' }]}>
          <Select
            mode="tags"
            maxTagCount={1}
            filterOption={filterOption}
            showSearch
            placeholder="Select an event"
            onChange={onEventChange}
          >
            {events.map(event => (
              <Option key={event.id}>{event.name}</Option>
            ))}
          </Select>
        </Form.Item>
      )}

      <Form.Item name="type" label="Type" rules={[{ required: true }]}>
        <Select placeholder="Choose event type">{entityTypes}</Select>
      </Form.Item>
      <Form.Item
        required
        name="disciplineId"
        label="Discipline"
        rules={[{ required: true, message: 'Please select a discipline' }]}
      >
        <Select placeholder="Select a discipline">
          {disciplines.map(({ id, name }) => (
            <Select.Option key={id} value={id}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="special" label="Special">
        <Select placeholder="Add tags" mode="tags" style={{ minWidth: 100 }} tokenSeparators={[',']} allowClear>
          {SPECIAL_ENTITY_TAGS.map((tag: string) => (
            <Option key={tag} value={tag}>
              {tag}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="timeZone" label="TimeZone">
        <Select placeholder="Choose a timezone">
          {TIMEZONES.map(tz => (
            <Option key={tz} value={tz}>
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
            rules={[{ required: true, message: 'Please enter start date and time' }]}
          >
            <DatePicker
              format="YYYY-MM-DD HH:mm"
              showTime={{ format: 'HH:mm' }}
              placeholder="Select start date & time"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="endTime"
            label="End Date and Time"
            rules={[{ required: true, message: 'Please enter end date and time' }]}
          >
            <DatePicker format="YYYY-MM-DD HH:mm" showTime={{ format: 'HH:mm' }} placeholder="Select end date & time" />
          </Form.Item>
        </Col>
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
        <Input placeholder="Enter description URL" />
      </Form.Item>

      <Form.Item name={['taskOwner', 'id']} label="Task Owner">
        <UserSearch
          placeholder="Select a task owner"
          defaultValues={data?.organizer ? [data.organizer] : []}
          searchFn={loadUsers}
        />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <TextArea placeholder="Add a brief description" />
      </Form.Item>

      <Form.Item name="place" label="Place">
        <Input placeholder="Enter event location" />
      </Form.Item>
    </ModalForm>
  );
}

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
    (input, option) => {
      if (!input) {
        return false;
      }
      const event = events.find(e => {
        return e.id === +option?.value;
      });
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
        <Form.Item
          name="event"
          label="Event"
          rules={[{ required: true, message: 'Please select an event' }]}
          tooltip="sdfasfa"
        >
          <Select
            mode="tags"
            maxTagCount={1}
            filterOption={filterOption}
            showSearch
            placeholder="Please select a event"
            onChange={onEventChange}
          >
            {events.map(event => (
              <Option key={event.id}>{event.name}</Option>
            ))}
          </Select>
        </Form.Item>
      )}

      <Form.Item name="type" label="Type" rules={[{ required: true }]}>
        <Select>{entityTypes}</Select>
      </Form.Item>
      <Form.Item
        required
        name="disciplineId"
        label="Discipline"
        rules={[{ required: true, message: 'Please select a discipline' }]}
      >
        <Select>
          {disciplines.map(({ id, name }) => (
            <Select.Option key={id} value={id}>
              {name}
            </Select.Option>
          ))}
        </Select>
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
      <Form.Item name="timeZone" label="TimeZone">
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
        <Input />
      </Form.Item>
    </ModalForm>
  );
}

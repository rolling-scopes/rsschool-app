import { Col, DatePicker, Form, Input, Row, Select } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { CourseEventDto } from 'api';
import { ModalForm } from 'components/Forms';
import { UserSearch } from 'components/UserSearch';
import { TIMEZONES } from 'configs/timezones';
import { EVENT_TYPES } from 'data/eventTypes';
import { isNumber } from 'lodash';
import { SPECIAL_ENTITY_TAGS } from 'modules/Schedule/constants';
import { useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import { Event, EventService } from 'services/event';
import { UserService } from 'services/user';
import { urlPattern } from 'services/validators';

const { Option } = Select;

type Props = {
  data: Partial<CourseEventDto> | null;
  onCancel: () => void;
};

const eventService = new EventService();
const userService = new UserService();

export function CourseEventModal(props: Props) {
  const { data, onCancel } = props;
  const [isNewEvent, setIsNewEvent] = useState<boolean>(false);
  const [form] = Form.useForm();

  const handleModalSubmit = async (values: any) => {
    console.log('🚀 ~ file: index.tsx ~ line 22 ~ handleModalSubmit ~ values', values, isNewEvent);
  };

  const loadUsers = async (searchText: string) => {
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
            setIsNewEvent(isNumber(value.at(-1)) ? false : true);
            form.setFieldValue('event', value.at(-1));
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
        <Input style={{ minWidth: 250 }} />
      </Form.Item>
    </ModalForm>
  );
}

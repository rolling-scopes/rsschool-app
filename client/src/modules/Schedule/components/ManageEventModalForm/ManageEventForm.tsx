import { Button, Col, DatePicker, Divider, Form, Input, InputNumber, message, Row, Select } from 'antd';
import { CreateCourseTaskDtoCheckerEnum } from 'api';
import { UserSearch } from 'components/UserSearch';
import { withSession } from 'components/withSession';
import { TIMEZONES } from 'configs/timezones';
import { EVENT_TYPES } from 'data/eventTypes';
import { SPECIAL_ENTITY_TAGS } from 'modules/Schedule/constants';
import moment from 'moment-timezone';
import React from 'react';
import { CourseEvent, CourseService } from 'services/course';
import { Event, EventService } from 'services/event';
import { UserService } from 'services/user';
import { urlPattern } from 'services/validators';

const { Option } = Select;
const { TextArea } = Input;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const validateMessages = {
  required: '${label} is required!',
  types: {
    email: '${label} is not validate email!',
    number: '${label} is not a validate number!',
  },
  number: {
    range: '${label} must be between ${min} and ${max}',
  },
};

type Props = {
  handleCancel: () => void;
  onFieldsChange: (values: any) => void;
  courseId: number;
  entityType: string;
  onEntityTypeChange: (type: string) => void;
  editableRecord: CourseEvent | null;
  refreshData: Function;
};

const FormEntity: React.FC<Props> = ({
  handleCancel,
  courseId,
  onFieldsChange,
  onEntityTypeChange,
  entityType,
  editableRecord,
  refreshData,
}) => {
  const isUpdateMode = editableRecord ? true : false;

  const handleModalSubmit = async (values: any) => {
    try {
      await createEvent(courseId, values, isUpdateMode, editableRecord);
      await refreshData();
      message.success(`Your event successfully ${isUpdateMode ? 'updated' : 'added'}`);
    } catch (error) {
      message.error('An error occurred. Please try later.');
    } finally {
      handleCancel();
    }
  };

  const handleFormChange = (_changedValues: any, allValues: any) => {
    onFieldsChange(allValues);
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
    <Form
      className="form-add-wrapper"
      {...layout}
      onFinish={handleModalSubmit}
      onValuesChange={handleFormChange}
      validateMessages={validateMessages}
      initialValues={getInitialValues(entityType, editableRecord)}
    >
      <Form.Item name="entityType" label="Entity type">
        <Select onChange={selectedValue => onEntityTypeChange(selectedValue as string)} disabled={isUpdateMode}>
          <Option value="event">Event</Option>
        </Select>
      </Form.Item>

      <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter task name' }]}>
        <Input />
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

      {entityType === 'task' && (
        <Form.Item
          name="range"
          label="Start - End Date"
          rules={[{ required: true, type: 'array', message: 'Please enter start and end date' }]}
        >
          <DatePicker.RangePicker format="YYYY-MM-DD HH:mm" showTime={{ format: 'HH:mm' }} />
        </Form.Item>
      )}

      <Form.Item
        name="dateTime"
        label="Date and Time"
        rules={[{ required: true, message: 'Please enter date and time' }]}
      >
        <DatePicker format="YYYY-MM-DD HH:mm" showTime={{ format: 'HH:mm' }} />
      </Form.Item>

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

      <Form.Item name="organizerId" label="Organizer" rules={[{ required: false }]}>
        {/* <UserSearch searchFn={loadUsers} /> */}
        <UserSearch defaultValues={getDefaultOrganizer(entityType, editableRecord)} searchFn={loadUsers} />
      </Form.Item>

      <Form.Item name="duration" rules={[{ type: 'number' }]} label="Duration">
        <InputNumber min={0} />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <TextArea />
      </Form.Item>

      <Form.Item name="place" label="Place">
        <Input style={{ minWidth: 250 }} />
      </Form.Item>

      <Divider />

      <Row justify="center" align="middle" gutter={[16, 16]}>
        <Col>
          <Button type="primary" htmlType="submit" style={{ margin: '0 10px' }}>
            Submit
          </Button>
          <Button type="default" htmlType="submit" onClick={handleCancel} style={{ margin: '0 10px' }}>
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

const getDefaultOrganizer = (entityType: string, data: any) => {
  if (!data) {
    return [];
  }

  if (entityType === 'task') {
    return data.taskOwner ? [data.taskOwner] : [];
  }

  return data.organizer ? [data.organizer] : [];
};

const getInitialValues = (entityType: string, data: any) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (!data) {
    return {
      entityType,
      maxScore: 100,
      scoreWeight: 1,
      timeZone,
      checker: CreateCourseTaskDtoCheckerEnum.Mentor,
    };
  }

  return {
    ...data,
    name: data.event.name,
    type: data.event.type,
    descriptionUrl: data.event.descriptionUrl ? data.event.descriptionUrl : '',
    description: data.event.description ? data.event.description : '',
    entityType,
    timeZone,
    organizerId: data.organizer ? data.organizer.id : undefined,
    special: data && data.special ? data.special.split(',') : [],
    dateTime: (data && moment(data.dateTime)) || null,
  };
};

const loadUsers = async (searchText: string) => {
  return new UserService().searchUser(searchText);
};

const createEvent = async (
  courseId: number,
  values: any,
  isUpdateMode: boolean,
  editableRecord: CourseEvent | null,
) => {
  const eventService = new EventService();
  const serviceCouse = new CourseService(courseId);

  const templateEventData = {
    name: values.name,
    type: values.type,
    descriptionUrl: values.descriptionUrl,
    description: values.description,
  } as Partial<Event>;

  let eventTemplateId;

  if (isUpdateMode && editableRecord) {
    eventTemplateId = editableRecord.event.id;
    await eventService.updateEvent(eventTemplateId, templateEventData);
  } else {
    const data: any = await eventService.createEvent(templateEventData);
    eventTemplateId = data.identifiers[0].id;
  }

  values = {
    eventId: eventTemplateId,
    special: values.special ? values.special.join(',') : '',
    dateTime: values.dateTime || null,
    duration: values.duration || null,
    place: values.place || null,
    organizer: values.organizerId ? { id: values.organizerId } : null,
  };

  if (isUpdateMode && editableRecord) {
    await serviceCouse.updateCourseEvent(editableRecord.id, values);
  } else {
    await serviceCouse.createCourseEvent(values);
  }
};

export default withSession(FormEntity);

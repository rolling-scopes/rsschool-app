import React, { useState } from 'react';
import { Task, TaskService } from 'services/task';
import { CourseEvent, CourseService } from 'services/course';
import { withSession } from 'components';
import { UserSearch } from 'components/UserSearch';
import { UserService } from 'services/user';
import { formatTimezoneToUTC } from 'services/formatter';
import { Form, Input, InputNumber, Button, DatePicker, Select, Alert, Row, Col, message } from 'antd';
import moment from 'moment-timezone';
import { EVENT_TYPES, SPECIAL_ENTITY_TAGS, TASK_TYPES } from './model';
import { TIMEZONES } from '../../configs/timezones';
import { Event, EventService } from 'services/event';

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
  const [isFormSubmitted, setFormSubmitted] = useState(false);
  const isUpdateMode = editableRecord ? true : false;

  const handleModalSubmit = async (values: any) => {
    try {
      if (entityType === 'task') {
        await createTask(courseId, values, isUpdateMode, editableRecord);
      } else {
        await createEvent(courseId, values, isUpdateMode, editableRecord);
      }
    } catch (error) {
      message.error('An error occurred. Please try later.');
      return;
    }

    setFormSubmitted(true);
    await refreshData();
  };

  const handleFormChange = (_changedValues: any, allValues: any) => {
    onFieldsChange(allValues);
  };

  if (isFormSubmitted) {
    return <Alert message={`Your task successfully ${isUpdateMode ? 'updated' : 'added'}`} type="success" showIcon />;
  }

  const entityTypes =
    entityType === 'task'
      ? TASK_TYPES.map(tag => {
          return (
            <Option key={tag} value={tag}>
              {tag}
            </Option>
          );
        })
      : EVENT_TYPES.map(tag => {
          return (
            <Option key={tag} value={tag}>
              {tag}
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
          <Option value="task">Task</Option>
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
              {tz}
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

      {entityType === 'event' && (
        <Form.Item
          name="dateTime"
          label="Date and Time"
          rules={[{ required: true, message: 'Please enter date and time' }]}
        >
          <DatePicker format="YYYY-MM-DD HH:mm" showTime={{ format: 'HH:mm' }} />
        </Form.Item>
      )}

      <Form.Item name="descriptionUrl" label="Link">
        <Input />
      </Form.Item>

      <Form.Item name="organizerId" label="Organizer" rules={[{ required: false }]}>
        <UserSearch searchFn={loadUsers} />
      </Form.Item>

      <Form.Item name="duration" rules={[{ type: 'number' }]} label="Duration">
        <InputNumber min={0} />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <TextArea />
      </Form.Item>

      {entityType === 'task' && (
        <>
          <Form.Item name="maxScore" label="Max score" rules={[{ required: true, message: 'Please enter max score' }]}>
            <InputNumber step={1} min={0} />
          </Form.Item>
          <Form.Item
            name="scoreWeight"
            label="Score Weight"
            rules={[{ required: true, message: 'Please enter score weight' }]}
          >
            <InputNumber step={0.1} />
          </Form.Item>
        </>
      )}
      {entityType === 'event' && (
        <Form.Item name="place" label="Place">
          <Input style={{ minWidth: 250 }} />
        </Form.Item>
      )}
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

const getInitialValues = (entityType: string, data: any) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (!data) {
    return {
      entityType,
      maxScore: 100,
      scoreWeight: 1,
      timeZone,
    };
  }

  if (entityType === 'task') {
    return {
      ...data,
      entityType,
      timeZone,
      organizerId: data.taskOwner ? data.taskOwner.githubId : '',
      special: data && data.special ? data.special.split(',') : [],
      maxScore: (data && data.maxScore) ?? 100,
      scoreWeight: (data && data.scoreWeight) ?? 1,
      description: data.description ? data.description : '',
      range:
        data && data.studentStartDate && data.studentEndDate
          ? [
              data.studentStartDate ? moment.tz(data.studentStartDate, timeZone) : null,
              data.studentEndDate ? moment.tz(data.studentEndDate, timeZone) : null,
            ]
          : null,
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
    organizerId: data.organizer ? data.organizer.githubId : '',
    special: data && data.special ? data.special.split(',') : [],
    dateTime: (data && moment(data.dateTime)) || null,
  };
};

const loadUsers = async (searchText: string) => {
  return new UserService().searchUser(searchText);
};

const createTask = async (courseId: number, values: any, isUpdateMode: boolean, editableRecord: CourseEvent | null) => {
  const taskService = new TaskService();
  const serviceCouseTask = new CourseService(courseId);

  const templateTaskData = {
    name: values.name,
    type: values.type,
    descriptionUrl: values.descriptionUrl || '',
    description: values.description || '',
    verification: 'manual',
    githubPrRequired: false,
  } as Partial<Task>;

  let taskTemplateId;

  if (isUpdateMode && editableRecord) {
    taskTemplateId = editableRecord.id;
    await taskService.updateTask(taskTemplateId, templateTaskData);
  } else {
    const data: any = await taskService.createTask(templateTaskData);
    taskTemplateId = data.identifiers[0].id;
  }

  const [startDate, endDate] = values.range || [null, null];
  values = {
    courseId,
    taskId: taskTemplateId,
    special: values.special ? values.special.join(',') : '',
    studentStartDate: startDate ? formatTimezoneToUTC(startDate, values.timeZone) : null,
    studentEndDate: endDate ? formatTimezoneToUTC(endDate, values.timeZone) : null,
    duration: values.duration ? values.duration : null,

    scoreWeight: values.scoreWeight ? values.scoreWeight : 1,
    maxScore: values.maxScore ? values.maxScore : 100,
    taskOwnerId: values.organizerId ? values.organizerId : null,
  };

  if (isUpdateMode && editableRecord) {
    await serviceCouseTask.updateCourseTask(editableRecord.id, values);
  } else {
    await serviceCouseTask.createCourseTask(values);
  }
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
    courseId,
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

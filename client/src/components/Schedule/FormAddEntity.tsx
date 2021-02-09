import React, { useState } from 'react';
import { TaskService } from 'services/task';
import { CourseService, CourseTaskDetails } from 'services/course';
import { withSession } from 'components';
import { UserSearch } from 'components/UserSearch';
import { UserService } from 'services/user';
import { formatTimezoneToUTC } from 'services/formatter';
import { union } from 'lodash';
import { Form, Input, InputNumber, Button, DatePicker, Select, Alert, Row, Col } from 'antd';
import 'moment-timezone';

import { EVENT_TYPES, SPECIAL_ENTITY_TAGS } from './model';
import { TIMEZONES } from '../../configs/timezones';

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
  links: 'Input link or delete this field.',
};

type Props = {
  handleCancel: any;
  onFieldsChange: any;
  courseId: number;
  entityType: string;
  onEntityTypeChange: (type: string) => void;
  tags: string[];
};

const FormAddEntity: React.FC<Props> = ({
  handleCancel,
  courseId,
  tags,
  onFieldsChange,
  onEntityTypeChange,
  entityType,
}: Props) => {
  const [isSuccess, setSuccess] = useState(false);

  const entityTypes = union(EVENT_TYPES, tags).filter(tag => tag !== 'deadline');

  const handleModalSubmit = async (values: any) => {
    if (entityType === 'task') {
      await createTask(courseId, values);
    }

    // const data: any = await serviceTask.createTask(values);
    // const taskTemplateId = data.identifiers[0].id;

    // const [startDate, endDate] = values.range || [null, null];
    // values = {
    //   ...values,
    //   courseId,
    //   taskId: taskTemplateId,
    //   special: values.special ? values.special.join(',') : '',
    //   author: values.author ? values.author : 'admin',
    //   studentStartDate: startDate ? formatTimezoneToUTC(startDate, values.timeZone) : null,
    //   studentEndDate: endDate ? formatTimezoneToUTC(endDate, values.timeZone) : null,
    //   descriptionUrl: values.links ? values.links : ['https://www.google.com/'],
    // };

    // await serviceCouseTask.createCourseTask(values);

    setSuccess(true);
  };

  const handleFormChange = (_changedValues: any, allValues: any) => {
    onFieldsChange(allValues);
  };

  if (isSuccess) {
    return <Alert message="Your task successfully added" type="success" showIcon />;
  }

  return (
    <Form
      className="form-add-wrapper"
      {...layout}
      // name="nest-messages"
      onFinish={handleModalSubmit}
      // onChange={handleFormChange}
      onValuesChange={handleFormChange}
      // onChange={values => {
      //   setModalData({ ...modalData, checker: values.checker }); // not done
      // }}
      validateMessages={validateMessages}
      initialValues={getInitialValues(entityType, {})}
      // onFieldsChange={onFieldsChange}
    >
      <Form.Item name="entityType" label="Entity type">
        <Select onChange={selectedValue => onEntityTypeChange(selectedValue as string)}>
          <Option value="task">Task</Option>
          <Option value="event">Event</Option>
        </Select>
      </Form.Item>

      <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter task name' }]}>
        <Input />
      </Form.Item>

      <Form.Item name="type" label="Type" rules={[{ required: true }]}>
        <Select>
          {entityTypes.map(type => (
            <Select.Option value={type} key={type}>
              {type}
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
        {/* <UserSearch defaultValues={modalData?.taskOwner ? [modalData.taskOwner] : []} searchFn={loadUsers} /> */}
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
          <Form.Item name="maxScore" label="Score" rules={[{ required: true, message: 'Please enter max score' }]}>
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

const getInitialValues = (entityType: string, modalData: Partial<CourseTaskDetails> = {}) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return {
    // ...modalData,
    entityType: entityType,
    timeZone,
    // taskOwnerId: modalData.taskOwner ? modalData.taskOwner.id : undefined,
    maxScore: modalData.maxScore || 100,
    scoreWeight: modalData.scoreWeight ?? 1,
    // range:
    //   modalData.studentStartDate && modalData.studentEndDate
    //     ? [
    //         modalData.studentStartDate ? moment.tz(modalData.studentStartDate, timeZone) : null,
    //         modalData.studentEndDate ? moment.tz(modalData.studentEndDate, timeZone) : null,
    //       ]
    //     : null,
  };
};

const loadUsers = async (searchText: string) => {
  return new UserService().searchUser(searchText);
};

const createTask = async (courseId: number, values: any) => {
  const serviceTask = new TaskService();
  const serviceCouseTask = new CourseService(courseId);

  const data: any = await serviceTask.createTask(values);
  const taskTemplateId = data.identifiers[0].id;

  const [startDate, endDate] = values.range || [null, null];
  values = {
    ...values,
    courseId,
    taskId: taskTemplateId,
    special: values.special ? values.special.join(',') : '',
    author: values.author ? values.author : 'admin',
    studentStartDate: startDate ? formatTimezoneToUTC(startDate, values.timeZone) : null,
    studentEndDate: endDate ? formatTimezoneToUTC(endDate, values.timeZone) : null,
    descriptionUrl: values.descriptionUrl,
  };

  await serviceCouseTask.createCourseTask(values);
};

export default withSession(FormAddEntity);

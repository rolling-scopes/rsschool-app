import React, { useState, useMemo } from 'react';
import { useAsync } from 'react-use';
import { Task, TaskService } from 'services/task';
import { CourseService, CourseTaskDetails } from 'services/course';
import { withSession } from 'components';
import { Course } from '../../services/models';
import { UserSearch } from 'components/UserSearch';
import { UserService } from 'services/user';
import { formatTimezoneToUTC } from 'services/formatter';
import DynamicFieldSet from '../DynamicLinksField'
import { union } from 'lodash';
import { Form, Input, InputNumber, Button, Upload, DatePicker, Select, Alert } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import 'moment-timezone';

import { EVENT_TYPES } from '../../components/Schedule/model';
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

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

type Props = {
  handleCancel: any,
  handleChangeLinks: any,
  onFieldsChange: any,
  onSelectChange: any,
  loading: any,
  error: any,
  course: Course;
}

const FormAddTask: React.FC<Props> = (props) => {
  const {
    handleCancel,
    handleChangeLinks,
    onFieldsChange,
    error,
    course,
  } = props;

  const courseId = course.id;
  const serviceTask = new TaskService();
  const userService = new UserService();
  const serviceCouseTask = useMemo(() => new CourseService(courseId), [courseId]);
  
  const [isSuccess, setSuccess] = useState(false);
  const [tasks, setTasks] = useState([] as Task[]);
  const [modalData, setModalData] = useState(null as Partial<CourseTaskDetails> | null);

  useAsync(async () => {
    const tasks = await serviceTask.getTasks();
    setTasks(tasks);
  }, [modalData]);

  const allTags = union(...tasks.map(d => d.tags || []));

  const loadUsers = async (searchText: string) => {
    return userService.searchUser(searchText);
  };

  const handleModalSubmit = async (values: any) => { 
    console.log('before -- ', values);
    const taskId = await serviceTask.createTask(values);

    const [startDate, endDate] = values.range || [null, null];
    values = {
      ...values,
      courseId,
      taskId: taskId.identifiers[0].id,
      author: values.author ? values.author : 'admin',
      studentStartDate: startDate ? formatTimezoneToUTC(startDate, values.timeZone) : null,
      studentEndDate: endDate ? formatTimezoneToUTC(endDate, values.timeZone) : null,
      descriptionUrl: values.links ? values.links : ['https://www.google.com/'],
      photo: values.photo ? true : null,      
    };

    if (!error) {
      setSuccess(true);
    }
    console.log('after -- ', values);
    await serviceCouseTask.createCourseTask(values);
  };

  if (isSuccess && !error) {
    return <Alert message="Your task successfully added" type="success" showIcon />;
  }
  if (error) {
    return <Alert message="Something went wrong" type="error" showIcon />;
  }
    
  return (
    <Form
      className="form-add-wrapper"
      {...layout}
      name="nest-messages"
      onFinish={handleModalSubmit}
      onChange={values => {
        setModalData({ ...modalData, checker: values.checker }); // not done
      }}
      validateMessages={validateMessages}
      initialValues={{
        tag: 'self education',
      }}    
      onFieldsChange={onFieldsChange}
    >
      <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter task name' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="type" label="Task Type">
        <Select>
          {EVENT_TYPES.map(type => <Select.Option value={type} key={type}>{type}</Select.Option>)} 
        </Select>
      </Form.Item>
      <Form.Item
        name="taskOwnerId"
        label="Task Owner"
        rules={[{ required: false, message: 'Please select a task owner' }]}
      >
        <UserSearch defaultValues={modalData?.taskOwner ? [modalData.taskOwner] : []} searchFn={loadUsers} />
      </Form.Item>
      <Form.Item name="tags" label="Tags">
        <Select mode="tags">
          {allTags.map(tag => (
            <Select.Option key={tag} value={tag}>
              {tag}
            </Select.Option>
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
      <Form.Item
        name="range"
        label="Start - End Date"
        rules={[{ required: false, type: 'array', message: 'Please enter start and end date' }]}
      >
        <DatePicker.RangePicker format="YYYY-MM-DD HH:mm" showTime={{ format: 'HH:mm' }} />
      </Form.Item>
      <Form.Item name="duration" rules={[{ type: 'number', min: 0 }]} label="Duration">
        <InputNumber min={0} step={0.5} />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <TextArea />
      </Form.Item>
      <Form.Item name="result" label="Result">
        <Input />
      </Form.Item>
      <Form.Item name="remark" label="Remark">
        <Input />
      </Form.Item>
      <DynamicFieldSet handleChangeLinks={handleChangeLinks} />   
      <Form.Item name="photo" valuePropName="fileList" getValueFromEvent={normFile} label="Photo">
        <Upload name="logo" action="/upload.do" listType="picture">
          <Button icon={<UploadOutlined />}>Click to upload</Button>
        </Upload>
      </Form.Item>
      <div style={{width: '50%', margin: '0 auto'}}>
        <Button type="primary" htmlType="submit" style={{margin: '0 10px'}}>
          Submit
        </Button>
        <Button type="default" htmlType="submit" onClick={handleCancel} style={{margin: '0 10px'}}>
          Cancel
        </Button>
      </div>
    </Form>
  );
};

export default withSession(FormAddTask);
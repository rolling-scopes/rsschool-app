import { Col, DatePicker, Form, InputNumber, Row, Select } from 'antd';
import { CreateCourseTaskDto, CreateCourseTaskDtoCheckerEnum } from 'api';
import { ModalForm } from 'components/Forms';
import { tagsRenderer } from 'components/Table';
import { UserSearch } from 'components/UserSearch';
import { TASK_TYPES } from 'data/taskTypes';
import { times } from 'lodash';
import moment from 'moment-timezone';
import { useCallback, useEffect, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseTaskDetails } from 'services/course';
import { formatTimezoneToUTC } from 'services/formatter';
import { Task, TaskService } from 'services/task';
import { UserService } from 'services/user';

const { Option } = Select;

type Props = {
  onCancel: () => void;
  onSubmit: (record: CreateCourseTaskDto) => void;
  data: Partial<CourseTaskDetails> | null;
};

const userService = new UserService();
const taskService = new TaskService();

export function CourseTaskModal(props: Props) {
  const { data } = props;
  const [changes, setChanges] = useState({} as Record<string, any>);

  const { loading, value: tasks = [] } = useAsync(() => taskService.getTasks(), []);

  useEffect(() => {
    setChanges(data ? { ...data, changes } : {});
  }, [data]);

  const loadUsers = async (searchText: string) => {
    return userService.searchUser(searchText);
  };

  const handleModalSubmit = async (values: any) => {
    const record = createRecord(values);
    props.onSubmit(record);
  };

  const handleModalCancel = () => {
    setChanges({});
    props.onCancel();
  };

  const filterOption = useCallback(
    (input, option) => {
      if (!input) {
        return false;
      }
      const task = tasks.find(t => t.id === option?.value);
      return task?.name.toLowerCase().includes(input.toLowerCase()) ?? false;
    },
    [tasks],
  );

  return (
    <ModalForm
      loading={loading}
      getInitialValues={getInitialValues}
      data={data}
      onChange={values => setChanges({ checker: values.checker })}
      title="Course Task"
      submit={handleModalSubmit}
      cancel={handleModalCancel}
    >
      <Form.Item name="taskId" label="Task" rules={[{ required: true, message: 'Please select a task' }]}>
        <Select filterOption={filterOption} showSearch placeholder="Please select a task">
          {tasks.map((task: Task) => (
            <Option key={task.id} value={task.id}>
              {task.name} {tagsRenderer(task.tags)}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="type" label="Task Type">
        <Select placeholder="Please select type">
          {TASK_TYPES.map(({ id, name }) => (
            <Select.Option key={id} value={id}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="checker" required label="Checker">
        <Select placeholder="Please select who checks">
          <Option value={CreateCourseTaskDtoCheckerEnum.AutoTest}>Auto-Test</Option>
          <Option value={CreateCourseTaskDtoCheckerEnum.Mentor}>Mentor</Option>
          <Option value={CreateCourseTaskDtoCheckerEnum.Assigned}>Cross-Mentor</Option>
          <Option value={CreateCourseTaskDtoCheckerEnum.TaskOwner}>Task Owner</Option>
          <Option value={CreateCourseTaskDtoCheckerEnum.CrossCheck}>Cross-Check</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="taskOwnerId"
        label="Task Owner"
        rules={[{ required: false, message: 'Please select a task owner' }]}
      >
        <UserSearch defaultValues={data?.taskOwner ? [data.taskOwner] : []} searchFn={loadUsers} />
      </Form.Item>
      <Form.Item name="timeZone" label="TimeZone">
        <Select defaultValue="UTC" placeholder="Please select a timezone">
          <Option value="UTC">UTC</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="range"
        label="Start Date - End Date"
        rules={[{ required: true, type: 'array', message: 'Please enter start and end date' }]}
      >
        <DatePicker.RangePicker format="YYYY-MM-DD HH:mm" showTime={{ format: 'HH:mm' }} />
      </Form.Item>
      {changes?.checker === 'crossCheck' ? (
        <Form.Item name="crossCheckEndDate" label="Cross-Check End Date">
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
      ) : null}
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item name="maxScore" label="Score" rules={[{ required: true, message: 'Please enter max score' }]}>
            <InputNumber step={1} min={0} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="scoreWeight"
            label="Score Weight"
            rules={[{ required: true, message: 'Please enter score weight' }]}
          >
            <InputNumber step={0.1} />
          </Form.Item>
        </Col>
      </Row>

      {changes?.checker === 'crossCheck' ? (
        <Form.Item name="pairsCount" label="Cross-Check Pairs Count">
          <Select placeholder="Cross-Check Pairs Count">
            {times(10, num => (
              <Option key={num} value={num + 1}>
                {num + 1}
              </Option>
            ))}
          </Select>
        </Form.Item>
      ) : null}
    </ModalForm>
  );
}

function createRecord(values: any): CreateCourseTaskDto {
  const [startDate, endDate] = values.range;

  const data = {
    studentStartDate: formatTimezoneToUTC(startDate, values.timeZone),
    studentEndDate: formatTimezoneToUTC(endDate, values.timeZone),
    crossCheckEndDate: values.crossCheckEndDate
      ? formatTimezoneToUTC(values.crossCheckEndDate.set({ hour: 23, minute: 59 }), values.timeZone)
      : undefined,
    taskId: values.taskId,
    taskOwnerId: values.taskOwnerId,
    checker: values.checker,
    scoreWeight: values.scoreWeight,
    maxScore: values.maxScore,
    type: values.type,
    pairsCount: values.pairsCount,
  };

  return data;
}

function getInitialValues(modalData: Partial<CourseTaskDetails>) {
  const timeZone = 'UTC';

  return {
    ...modalData,
    timeZone,
    taskOwnerId: modalData.taskOwner ? modalData.taskOwner.id : undefined,
    maxScore: modalData.maxScore || 100,
    scoreWeight: modalData.scoreWeight ?? 1,
    crossCheckEndDate: modalData.crossCheckEndDate ? moment.tz(modalData.crossCheckEndDate, timeZone) : null,
    range:
      modalData.studentStartDate && modalData.studentEndDate
        ? [
            modalData.studentStartDate ? moment.tz(modalData.studentStartDate, timeZone) : null,
            modalData.studentEndDate ? moment.tz(modalData.studentEndDate, timeZone) : null,
          ]
        : null,
    checker: modalData.checker || CreateCourseTaskDtoCheckerEnum.AutoTest,
  };
}

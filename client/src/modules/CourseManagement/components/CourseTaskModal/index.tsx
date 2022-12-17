import { Checkbox, Col, DatePicker, Divider, Form, Input, InputNumber, message, Row, Select, Typography } from 'antd';
import { CourseTaskDto, CreateCourseTaskDto, CreateCourseTaskDtoCheckerEnum, TaskDto, TasksApi } from 'api';
import { ModalForm } from 'components/Forms';
import { tagsRenderer } from 'components/Table';
import { UserSearch } from 'components/UserSearch';
import { TASK_TYPES } from 'data/taskTypes';
import { times } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseTaskDetails } from 'services/course';
import { formatTimezoneToUTC } from 'services/formatter';
import { UserService } from 'services/user';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';

dayjs.extend(duration);
dayjs.extend(utc);

const { Option } = Select;

type Props = {
  onCancel: () => void;
  onSubmit: (record: CreateCourseTaskDto) => void;
  data: Partial<CourseTaskDto> | null;
};

const userService = new UserService();
const taskApi = new TasksApi();

export function CourseTaskModal(props: Props) {
  const { data } = props;
  const [changes, setChanges] = useState({} as Record<string, any>);
  const [isInvalidCrossCheckEndDate, setIsInvalidCrossCheckEndDate] = useState<boolean>(false);

  const { loading, value: tasksResponse } = useAsync(() => taskApi.getTasks(), []);
  const tasks = tasksResponse?.data ?? [];

  useEffect(() => {
    setChanges(data ? { ...data, changes } : {});
  }, [data]);

  const loadUsers = async (searchText: string) => {
    return userService.searchUser(searchText);
  };

  const isInvalidCrossCheckDuration = (startDate: string, endDate: string) => {
    const MIN_CROSSCHECK_DAYS_COUNT = 3;
    const MIN_CROSSCHECK_DURATION = MIN_CROSSCHECK_DAYS_COUNT * 24;
    return dayjs.duration(dayjs(endDate).diff(dayjs(startDate))).asHours() < MIN_CROSSCHECK_DURATION;
  };

  const handleModalSubmit = async (values: any) => {
    const record = createRecord(values);
    if (
      record.checker === 'crossCheck' &&
      isInvalidCrossCheckDuration(record.studentEndDate, record.crossCheckEndDate ?? '')
    ) {
      message.error('The minimum duration of a cross-check is 3 days.');
      setIsInvalidCrossCheckEndDate(true);
      return;
    }
    props.onSubmit(record);
  };

  const handleModalCancel = () => {
    setChanges({});
    props.onCancel();
  };

  const filterOption = useCallback(
    (input: string, option?: { value: number }): boolean => {
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
          {tasks.map((task: TaskDto) => (
            <Option key={task.id} value={task.id}>
              {task.name} {tagsRenderer(task.tags)}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item name="type" label="Task Type">
            <Select placeholder="Please select type">
              {TASK_TYPES.map(({ id, name }) => (
                <Select.Option key={id} value={id}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="checker" required label="Checker">
            <Select placeholder="Please select who checks">
              <Option value={CreateCourseTaskDtoCheckerEnum.AutoTest}>Auto-Test</Option>
              <Option value={CreateCourseTaskDtoCheckerEnum.Mentor}>Mentor</Option>
              <Option value={CreateCourseTaskDtoCheckerEnum.Assigned}>Cross-Mentor</Option>
              <Option value={CreateCourseTaskDtoCheckerEnum.TaskOwner}>Task Owner</Option>
              <Option value={CreateCourseTaskDtoCheckerEnum.CrossCheck}>Cross-Check</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name={['taskOwner', 'id']} label="Task Owner">
        <UserSearch
          placeholder="Please select a task owner"
          defaultValues={data?.taskOwner ? [data.taskOwner] : []}
          searchFn={loadUsers}
        />
      </Form.Item>
      <Row gutter={24}>
        <Col span={18}>
          <Form.Item
            name="range"
            label="Start Date - End Date"
            rules={[{ required: true, type: 'array', message: 'Please enter start and end date' }]}
          >
            <DatePicker.RangePicker
              format="YYYY-MM-DD HH:mm"
              showTime={{ format: 'HH:mm', defaultValue: [dayjs().hour(0).minute(0), dayjs().hour(23).minute(59)] }}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="timeZone" label="TimeZone">
            <Select defaultValue="UTC" placeholder="Please select a timezone">
              <Option value="UTC">UTC</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

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
        <>
          <Divider style={{ marginTop: 0, marginBottom: 8 }} />
          <Typography.Title level={4}>Cross-Check</Typography.Title>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="crossCheckEndDate"
                label="Cross-Check End Date"
                validateStatus={isInvalidCrossCheckEndDate ? 'error' : undefined}
                rules={[{ required: true, message: 'Please enter cross-check end date' }]}
                tooltip="Cross-Check End Date must be later than the End Date of the task. The minimum duration of a cross-check is 3 days. The cross-check will be completed at 23:59 UTC on the chosen day."
              >
                <DatePicker format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pairsCount"
                label="Cross-Check Pairs Count"
                rules={[{ required: true, message: 'Please enter cross-check pairs count' }]}
              >
                <Select placeholder="Cross-Check Pairs Count">
                  {times(10, num => (
                    <Option key={num} value={num + 1}>
                      {num + 1}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="submitText" label="Submit Text">
            <Input.TextArea placeholder="Free form text to display on submit form" />
          </Form.Item>
          <Form.Item name={['validations', 'githubIdInUrl']} valuePropName="checked">
            <Checkbox>Require Github Username in URL</Checkbox>
          </Form.Item>
        </>
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
    taskOwnerId: values.taskOwner?.id,
    checker: values.checker,
    scoreWeight: values.scoreWeight,
    maxScore: values.maxScore,
    type: values.type,
    pairsCount: values.pairsCount,
    submitText: values.submitText,
    validations: values.validations,
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
    crossCheckEndDate: modalData.crossCheckEndDate ? dayjs.utc(modalData.crossCheckEndDate, timeZone) : null,
    range:
      modalData.studentStartDate && modalData.studentEndDate
        ? [
            modalData.studentStartDate ? dayjs.utc(modalData.studentStartDate, timeZone) : null,
            modalData.studentEndDate ? dayjs.utc(modalData.studentEndDate, timeZone) : null,
          ]
        : null,
    checker: modalData.checker || CreateCourseTaskDtoCheckerEnum.AutoTest,
  };
}

import { useCallback, useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { Button, Col, DatePicker, Dropdown, Form, InputNumber, Menu, message, Row, Select, Table } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';
import { times } from 'lodash';
import { GithubUserLink } from 'components/GithubUserLink';
import { AdminPageLayout } from 'components/PageLayout';
import { withSession } from 'components/withSession';
import { ModalForm } from 'components/Forms';
import {
  dateRenderer,
  crossCheckDateRenderer,
  idFromArrayRenderer,
  stringSorter,
  tagsRenderer,
  crossCheckStatusRenderer,
} from 'components/Table';
import { UserSearch } from 'components/UserSearch';
import withCourseData from 'components/withCourseData';
import { CourseService, CourseTaskDetails, CrossCheckStatus } from 'services/course';
import { formatTimezoneToUTC } from 'services/formatter';
import { CoursePageProps } from 'services/models';
import { Task, TaskService } from 'services/task';
import { UserService } from 'services/user';
import { TASK_TYPES } from 'data/taskTypes';

const { Option } = Select;
const { Item, Divider } = Menu;

function Page(props: CoursePageProps) {
  const courseId = props.course.id;
  const userService = new UserService();
  const service = useMemo(() => new CourseService(courseId), [courseId]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([] as CourseTaskDetails[]);
  const [tasks, setTasks] = useState([] as Task[]);
  const [modalData, setModalData] = useState(null as Partial<CourseTaskDetails> | null);
  const [modalAction, setModalAction] = useState('update');

  const loadData = useCallback(async () => {
    setLoading(true);
    const [data, tasks] = await Promise.all([service.getCourseTasksDetails(), new TaskService().getTasks()]);
    setData(data);
    setTasks(tasks);
    setLoading(false);
  }, [courseId]);

  useAsync(loadData, [courseId]);

  const handleAddItem = () => {
    setModalData({});
    setModalAction('create');
  };

  const handleEditItem = (record: CourseTaskDetails) => {
    setModalData(record);
    setModalAction('update');
  };

  const handleDeleteItem = async (id: number) => {
    try {
      const result = confirm('Are you sure you want to delete this item?');
      if (!result) {
        return;
      }
      await service.deleteCourseTask(id);
      await loadData();
    } catch {
      message.error('Failed to delete item. Please try later.');
    }
  };

  const loadUsers = async (searchText: string) => {
    return userService.searchUser(searchText);
  };

  const handleModalSubmit = async (values: any) => {
    const record = createRecord(values);

    if (modalAction === 'update') {
      await service.updateCourseTask(modalData!.id!, record);
    } else {
      const { ...rest } = record;
      await service.createCourseTask(rest);
    }
    await loadData();

    setModalData(null);
  };

  const handleTaskDistribute = async (record: CourseTaskDetails) => {
    setLoading(true);
    await service.createTaskDistribution(record.id);
    setLoading(false);
  };

  const handleInterviewDistribute = async (record: CourseTaskDetails) => {
    setLoading(true);
    await service.createInterviewDistribution(record.id);
    setLoading(false);
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

  const getDropdownMenu = (record: CourseTaskDetails) => {
    const hasInterviewDistibute = record.type === 'interview';
    const hasTaskDistibute = record.checker === 'assigned';
    const hasCrossCheck = record.checker === 'crossCheck';

    const currentTimestamp = Date.now();
    const submitDeadlineTimestamp = new Date(record.studentEndDate).getTime();
    const isSubmitDeadlinePassed = currentTimestamp > submitDeadlineTimestamp;

    return (
      <Dropdown
        trigger={['click']}
        overlay={
          <Menu style={{ width: 200 }}>
            <Item onClick={() => handleEditItem(record)}>Edit</Item>
            <Item onClick={() => handleDeleteItem(record.id)}>Delete</Item>
            {hasTaskDistibute && <Item onClick={() => handleTaskDistribute(record)}>Distribute</Item>}
            {hasInterviewDistibute && <Item onClick={() => handleInterviewDistribute(record)}>Distribute</Item>}
            {hasCrossCheck && <Divider />}
            {hasCrossCheck && (
              <Item disabled={!isSubmitDeadlinePassed} onClick={() => handleCrossCheckDistribution(record)}>
                Cross-Check: Distribute
              </Item>
            )}
            {hasCrossCheck && (
              <Item
                disabled={!isSubmitDeadlinePassed || record.crossCheckStatus === CrossCheckStatus.Initial}
                onClick={() => handleCrossCheckCompletion(record)}
              >
                Cross-Check: Complete
              </Item>
            )}
          </Menu>
        }
      >
        <Button size="small">
          More <MoreOutlined />
        </Button>
      </Dropdown>
    );
  };

  const handleCrossCheckDistribution = async (record: CourseTaskDetails) => {
    try {
      const {
        data: { crossCheckPairs },
      } = await service.createCrossCheckDistribution(record.id);
      if (crossCheckPairs.length) {
        message.success('Cross-Check distrubtion has been created');
      } else {
        message.warn('Unable to create Cross-Check distribution: no solutions submitted');
      }
    } catch (e) {
      message.error('An error occurred.');
    } finally {
      await loadData();
    }
  };

  const handleCrossCheckCompletion = async (record: CourseTaskDetails) => {
    try {
      await service.createCrossCheckCompletion(record.id);

      message.success('Cross-Check completed has been created');
    } catch {
      message.error('An error occurred.');
    } finally {
      await loadData();
    }
  };

  const renderModal = (modalData: Partial<CourseTaskDetails> | null) => {
    return (
      <ModalForm
        getInitialValues={getInitialValues}
        data={modalData}
        onChange={values => {
          setModalData({ ...modalData, checker: values.checker });
        }}
        title="Course Task"
        submit={handleModalSubmit}
        cancel={() => setModalData(null)}
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
          <Select>
            {TASK_TYPES.map(({ id, name }) => (
              <Select.Option key={id} value={id}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="checker" required label="Checker">
          <Select placeholder="Please select who checks">
            <Option value="auto-test">Auto-Test</Option>
            <Option value="mentor">Mentor</Option>
            <Option value="assigned">Cross-Mentor</Option>
            <Option value="taskOwner">Task Owner</Option>
            <Option value="crossCheck">Cross-Check</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="taskOwnerId"
          label="Task Owner"
          rules={[{ required: false, message: 'Please select a task owner' }]}
        >
          <UserSearch defaultValues={modalData?.taskOwner ? [modalData.taskOwner] : []} searchFn={loadUsers} />
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
        {modalData?.checker === 'crossCheck' ? (
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

        {modalData?.checker === 'crossCheck' ? (
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
  };

  return (
    <AdminPageLayout loading={loading} session={props.session} courses={[props.course]}>
      <Button type="primary" onClick={handleAddItem}>
        Add Task
      </Button>
      <Table
        style={{ marginTop: 16 }}
        rowKey="id"
        pagination={false}
        size="small"
        dataSource={data}
        columns={getColumns(getDropdownMenu, { tasks })}
      />
      {renderModal(modalData)}
    </AdminPageLayout>
  );
}

function getColumns(getDropdownMenu: (record: CourseTaskDetails) => any, { tasks }: { tasks: any[] }) {
  return [
    { title: 'Id', dataIndex: 'id' },
    {
      title: 'Name',
      dataIndex: 'taskId',
      render: idFromArrayRenderer(tasks),
    },
    { title: 'Scores Count', dataIndex: 'resultsCount' },
    {
      title: 'Start Date',
      dataIndex: 'studentStartDate',
      render: dateRenderer,
      sorter: stringSorter('studentStartDate'),
    },
    { title: 'End Date', dataIndex: 'studentEndDate', render: dateRenderer, sorter: stringSorter('studentEndDate') },
    {
      title: 'Cross-Check End Date',
      dataIndex: 'crossCheckEndDate',
      render: crossCheckDateRenderer,
      sorter: stringSorter('crossCheckEndDate'),
    },
    {
      title: 'Cross-Check Status',
      dataIndex: 'crossCheckStatus',
      render: crossCheckStatusRenderer,
      sorter: stringSorter('crossCheckStatus'),
    },
    { title: 'Max Score', dataIndex: 'maxScore' },
    {
      title: 'Type',
      dataIndex: 'type',
    },
    { title: 'Score Weight', dataIndex: 'scoreWeight' },
    { title: 'Who Checks', dataIndex: 'checker' },
    {
      title: 'Task Owner',
      dataIndex: ['taskOwner', 'githubId'],
      render: (value: string) => (value ? <GithubUserLink value={value} /> : null),
    },
    {
      title: 'Pairs',
      dataIndex: 'pairsCount',
    },
    {
      dataIndex: 'actions',
      width: 80,
      render: (_: any, record: CourseTaskDetails) => {
        return getDropdownMenu(record);
      },
    },
  ];
}

function createRecord(values: any) {
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
    checker: modalData.checker || 'mentor',
  };
}

export default withCourseData(withSession(Page));

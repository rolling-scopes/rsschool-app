import { DownOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Dropdown, Form, InputNumber, Menu, message, Radio, Row, Select, Table } from 'antd';
import { GithubUserLink, PageLayout, withSession } from 'components';
import { ModalForm } from 'components/Forms';
import { dateRenderer, idFromArrayRenderer, stringSorter, tagsRenderer } from 'components/Table';
import { UserSearch } from 'components/UserSearch';
import withCourseData from 'components/withCourseData';
import moment from 'moment-timezone';
import { useCallback, useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, CourseTask } from 'services/course';
import { formatTimezoneToUTC } from 'services/formatter';
import { CoursePageProps } from 'services/models';
import { Stage, StageService } from 'services/stage';
import { Task, TaskService } from 'services/task';
import { UserService } from 'services/user';
import { DEFAULT_TIMEZONE, TIMEZONES } from 'configs/timezones';

type Props = CoursePageProps;

function Page(props: Props) {
  const courseId = props.course.id;
  const userService = new UserService();
  const service = useMemo(() => new CourseService(courseId), [courseId]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([] as CourseTask[]);
  const [stages, setStages] = useState([] as Stage[]);
  const [tasks, setTasks] = useState([] as Task[]);
  const [modalData, setModalData] = useState(null as Partial<CourseTask> | null);
  const [modalAction, setModalAction] = useState('update');

  const loadData = useCallback(async () => {
    setLoading(true);
    const [data, stages, tasks] = await Promise.all([
      service.getCourseTasks(),
      new StageService().getCourseStages(courseId),
      new TaskService().getTasks(),
    ]);
    setData(data);
    setStages(stages);
    setTasks(tasks);
    setLoading(false);
  }, [courseId]);

  useAsync(loadData, [courseId]);

  const handleAddItem = () => {
    setModalData({});
    setModalAction('create');
  };

  const handleEditItem = (record: CourseTask) => {
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
      const data = await service.getCourseTasks();
      setData(data);
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
      await loadData();
    } else {
      const courseTask = await service.createCourseTask(record);
      const updatedData = data.concat([courseTask]);
      setData(updatedData);
    }

    setModalData(null);
  };

  const handleDistribute = async (record: CourseTask) => {
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

  const getDropdownMenu = (record: CourseTask) => {
    const hasDistibute = record.type === 'interview' || record.checker === 'assigned';
    const hasCrossCheck = record.checker === 'crossCheck';
    return (
      <Dropdown
        trigger={['click']}
        overlay={
          <Menu style={{ width: 200 }}>
            <Menu.Item onClick={() => handleEditItem(record)}>Edit</Menu.Item>
            <Menu.Item onClick={() => handleDeleteItem(record.id)}>Delete</Menu.Item>
            {hasDistibute && <Menu.Item onClick={() => handleDistribute(record)}>Distribute</Menu.Item>}
            {hasCrossCheck && <Menu.Divider />}
            {hasCrossCheck && (
              <Menu.Item onClick={() => handleCrossCheckDistribution(record)}>Cross-Check: Distribute</Menu.Item>
            )}
            {hasCrossCheck && (
              <Menu.Item onClick={() => handleCrossCheckCompletion(record)}>Cross-Check: Complete</Menu.Item>
            )}
          </Menu>
        }
      >
        <a href="#">
          More <DownOutlined />
        </a>
      </Dropdown>
    );
  };

  const handleCrossCheckDistribution = async (record: CourseTask) => {
    try {
      await service.createCrossCheckDistribution(record.id);
      message.success('Cross-check Distrubtion has been created');
    } catch (e) {
      message.error('An error occurred.');
    }
  };

  const handleCrossCheckCompletion = async (record: CourseTask) => {
    try {
      setLoading(true);
      await service.createCrossCheckCompletion(record.id);

      message.success('Cross-Check completed has been created');
    } catch {
      message.error('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const renderModal = (modalData: Partial<CourseTask> | null) => {
    return (
      <ModalForm
        getInitialValues={getInitialValues}
        data={modalData}
        title="Course Task"
        submit={handleModalSubmit}
        cancel={() => setModalData(null)}
      >
        <Form.Item name="taskId" label="Task" rules={[{ required: true, message: 'Please select a task' }]}>
          <Select filterOption={filterOption} showSearch placeholder="Please select a task">
            {tasks.map((task: Task) => (
              <Select.Option key={task.id} value={task.id}>
                {task.name} {tagsRenderer(task.tags)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="stageId" label="Stage" rules={[{ required: true, message: 'Please select a stage' }]}>
          <Select placeholder="Please select a stage">
            {stages.map((stage: Stage) => (
              <Select.Option key={stage.id} value={stage.id}>
                {stage.name}
              </Select.Option>
            ))}
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
          <Select placeholder="Please select a timezone">
            {TIMEZONES.map(tz => (
              <Select.Option key={tz} value={tz}>
                {tz}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="range"
          label="Start Date - End Date"
          rules={[{ required: true, type: 'array', message: 'Please enter start and end date' }]}
        >
          <DatePicker.RangePicker format="YYYY-MM-DD HH:mm" showTime={{ format: 'HH:mm' }} />
        </Form.Item>
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

        <Form.Item name="checker" label="Who Checks">
          <Radio.Group>
            <Radio value="mentor">Mentor</Radio>
            <Radio value="assigned">Assigned</Radio>
            <Radio value="taskOwner">Task Owner</Radio>
            <Radio value="crossCheck">Cross-Check</Radio>
            <Radio value="jury">Jury</Radio>
          </Radio.Group>
        </Form.Item>
      </ModalForm>
    );
  };

  return (
    <PageLayout loading={loading} githubId={props.session.githubId}>
      <Button type="primary" onClick={handleAddItem}>
        Add Task
      </Button>
      <Table
        rowKey="id"
        pagination={false}
        size="small"
        dataSource={data}
        columns={getColumns(getDropdownMenu, { tasks, stages })}
      />
      {renderModal(modalData)}
    </PageLayout>
  );
}

function getColumns(getDropdownMenu: (record: CourseTask) => any, { tasks, stages }) {
  return [
    { title: 'Id', dataIndex: 'id' },
    {
      title: 'Name',
      dataIndex: 'taskId',
      render: idFromArrayRenderer(tasks),
    },
    { title: 'Scores Count', dataIndex: 'taskResultCount' },
    {
      title: 'Start Date',
      dataIndex: 'studentStartDate',
      render: dateRenderer,
      sorter: stringSorter('studentStartDate'),
    },
    { title: 'End Date', dataIndex: 'studentEndDate', render: dateRenderer, sorter: stringSorter('studentEndDate') },
    { title: 'Max Score', dataIndex: 'maxScore' },
    {
      title: 'Stage',
      dataIndex: 'stageId',
      render: idFromArrayRenderer(stages),
    },
    { title: 'Score Weight', dataIndex: 'scoreWeight' },
    { title: 'Who Checks', dataIndex: 'checker' },
    {
      title: 'Task Owner',
      dataIndex: ['taskOwner', 'githubId'],
      render: value => (value ? <GithubUserLink value={value} /> : null),
    },
    {
      dataIndex: 'actions',
      width: 80,
      render: (_, record: CourseTask) => {
        return getDropdownMenu(record);
      },
    },
  ];
}

function createRecord(values: any) {
  const [startDate, endDate] = values.range || [null, null];
  const data = {
    studentStartDate: startDate ? formatTimezoneToUTC(startDate, values.timeZone) : null,
    studentEndDate: endDate ? formatTimezoneToUTC(endDate, values.timeZone) : null,
    taskId: values.taskId,
    stageId: values.stageId,
    taskOwnerId: values.taskOwnerId,
    checker: values.checker,
    scoreWeight: values.scoreWeight,
    maxScore: values.maxScore,
  };
  return data;
}

function getInitialValues(modalData: Partial<CourseTask>) {
  return {
    ...modalData,
    taskOwnerId: modalData.taskOwner ? modalData.taskOwner.id : undefined,
    timeZone: DEFAULT_TIMEZONE,
    maxScore: modalData.maxScore || 100,
    scoreWeight: modalData.scoreWeight || 1,
    range:
      modalData.studentStartDate && modalData.studentEndDate
        ? [
            modalData.studentStartDate ? moment.tz(modalData.studentStartDate, DEFAULT_TIMEZONE) : null,
            modalData.studentEndDate ? moment.tz(modalData.studentEndDate, DEFAULT_TIMEZONE) : null,
          ]
        : null,
    checker: modalData.checker || 'mentor',
  };
}

export default withCourseData(withSession(Page));

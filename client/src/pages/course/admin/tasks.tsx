import { MoreOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Dropdown, Form, InputNumber, Menu, message, Row, Select, Table } from 'antd';
import { GithubUserLink, PageLayout, withSession } from 'components';
import { ModalForm } from 'components/Forms';
import { dateRenderer, idFromArrayRenderer, stringSorter, tagsRenderer } from 'components/Table';
import { UserSearch } from 'components/UserSearch';
import withCourseData from 'components/withCourseData';
import moment from 'moment-timezone';
import { useCallback, useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, CourseTaskDetails } from 'services/course';
import { formatTimezoneToUTC } from 'services/formatter';
import { CoursePageProps } from 'services/models';
import { Task, TaskService } from 'services/task';
import { UserService } from 'services/user';
import { TIMEZONES } from 'configs/timezones';
import { times } from 'lodash';

const Option = Select.Option;

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
    const record = createRecord(values, props.course.id);

    if (modalAction === 'update') {
      await service.updateCourseTask(modalData!.id!, record);
    } else {
      await service.createCourseTask(record);
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
    return (
      <Dropdown
        trigger={['click']}
        overlay={
          <Menu style={{ width: 200 }}>
            <Menu.Item onClick={() => handleEditItem(record)}>Edit</Menu.Item>
            <Menu.Item onClick={() => handleDeleteItem(record.id)}>Delete</Menu.Item>
            {hasTaskDistibute && <Menu.Item onClick={() => handleTaskDistribute(record)}>Distribute</Menu.Item>}
            {hasInterviewDistibute && (
              <Menu.Item onClick={() => handleInterviewDistribute(record)}>Distribute</Menu.Item>
            )}
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
        <Button size="small">
          More <MoreOutlined />
        </Button>
      </Dropdown>
    );
  };

  const handleCrossCheckDistribution = async (record: CourseTaskDetails) => {
    try {
      await service.createCrossCheckDistribution(record.id);
      message.success('Cross-Check distrubtion has been created');
    } catch (e) {
      message.error('An error occurred.');
    }
  };

  const handleCrossCheckCompletion = async (record: CourseTaskDetails) => {
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
            <Select.Option value="jstask">JS task</Select.Option>
            <Select.Option value="kotlintask">Kotlin task</Select.Option>
            <Select.Option value="objctask">ObjC task</Select.Option>
            <Select.Option value="htmltask">HTML task</Select.Option>
            <Select.Option value="htmlcssacademy">HTML/CSS Academy</Select.Option>
            <Select.Option value="cv:markdown">CV Markdown</Select.Option>
            <Select.Option value="cv:html">CV HTML</Select.Option>
            <Select.Option value="codewars:stage1">Codewars stage 1</Select.Option>
            <Select.Option value="codewars:stage2">Codewars stage 2</Select.Option>
            <Select.Option value="test">Test</Select.Option>
            <Select.Option value="codejam">Code Jam</Select.Option>
            <Select.Option value="interview">Interview</Select.Option>
            <Select.Option value="stage-interview">Technical Screening</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="checker" required label="Checker">
          <Select placeholder="Please select who checks">
            <Option value="auto-test">Auto-Test</Option>
            <Option value="mentor">Mentor</Option>
            <Option value="assigned">Cross-Mentor</Option>
            <Option value="taskOwner">Task Owner</Option>
            <Option value="crossCheck">Cross-Check</Option>
            <Option value="jury">Jury</Option>
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
              <Option key={tz} value={tz}>
                {tz}
              </Option>
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
    <PageLayout loading={loading} githubId={props.session.githubId}>
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
    </PageLayout>
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

function createRecord(values: any, courseId: number) {
  const [startDate, endDate] = values.range || [null, null];
  const data = {
    courseId,
    studentStartDate: startDate ? formatTimezoneToUTC(startDate, values.timeZone) : null,
    studentEndDate: endDate ? formatTimezoneToUTC(endDate, values.timeZone) : null,
    taskId: values.taskId,
    stageId: values.stageId,
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
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return {
    ...modalData,
    timeZone,
    taskOwnerId: modalData.taskOwner ? modalData.taskOwner.id : undefined,
    maxScore: modalData.maxScore || 100,
    scoreWeight: modalData.scoreWeight || 1,
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

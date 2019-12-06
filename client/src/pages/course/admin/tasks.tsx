import * as React from 'react';
import { Button, Col, DatePicker, Form, InputNumber, Modal, Radio, Row, Select, Table } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Header, withSession } from 'components';
import { dateRenderer, idFromArrayRenderer, tagsRenderer } from 'components/Table';
import withCourseData from 'components/withCourseData';
import { CourseService, CourseTask } from 'services/course';
import { formatTimezoneToUTC } from 'services/formatter';
import { CoursePageProps, PageWithModalState } from 'services/models';
import { Stage, StageService } from 'services/stage';
import { Task, TaskService } from 'services/task';
import { UserSearch } from 'components/UserSearch';
import { UserService } from 'services/user';
import { DEFAULT_TIMEZONE, TIMEZONES } from '../../../configs/timezones';
import moment from 'moment-timezone';

type Props = CoursePageProps & FormComponentProps;
interface State extends PageWithModalState<CourseTask> {
  tasks: Task[];
  stages: Stage[];
}

class CourseTasksPage extends React.Component<Props, State> {
  state: State = {
    tasks: [],
    data: [],
    stages: [],
    modalData: null,
    modalAction: 'update',
  };

  private userService = new UserService();
  private courseService: CourseService;

  constructor(props: Props) {
    super(props);
    this.courseService = new CourseService(props.course.id);
  }

  async componentDidMount() {
    const courseId = this.props.course.id;
    const [data, stages, tasks] = await Promise.all([
      this.courseService.getCourseTasks(),
      new StageService().getCourseStages(courseId),
      new TaskService().getTasks(),
    ]);
    this.setState({ data, stages, tasks });
  }

  private handleModalSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    this.props.form.validateFields(async (err: any, values: any) => {
      if (err) {
        return;
      }
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

      let courseTask;
      let updatedData;

      if (this.state.modalAction === 'update') {
        courseTask = await this.courseService.updateCourseTask(this.props.course.id, this.state.modalData!.id!, data);
        courseTask.taskOwnerId = values.taskOwnerId;
        updatedData = this.state.data.map(d => (d.id === courseTask.id ? { ...d, ...courseTask } : d));
      } else {
        courseTask = await this.courseService.createCourseTask(this.props.course.id, data);
        updatedData = this.state.data.concat([courseTask]);
      }

      this.setState({ modalData: null, data: updatedData });
    });
  };

  render() {
    if (!this.props.session) {
      return null;
    }
    return (
      <div>
        <Header username={this.props.session.githubId} />
        <Button type="primary" className="mt-3 ml-3" onClick={this.handleAddItem}>
          Add Task
        </Button>
        <Table
          className="m-3"
          rowKey="id"
          pagination={{ pageSize: 100 }}
          size="small"
          dataSource={this.state.data}
          columns={[
            { title: 'Id', dataIndex: 'id' },
            {
              title: 'Name',
              dataIndex: 'taskId',
              render: idFromArrayRenderer(this.state.tasks),
            },
            { title: 'Scores Count', dataIndex: 'taskResultCount' },
            { title: 'Start Date', dataIndex: 'studentStartDate', render: dateRenderer },
            { title: 'End Date', dataIndex: 'studentEndDate', render: dateRenderer },
            { title: 'Max Score', dataIndex: 'maxScore' },
            {
              title: 'Stage',
              dataIndex: 'stageId',
              render: idFromArrayRenderer(this.state.stages),
            },
            { title: 'Score Weight', dataIndex: 'scoreWeight' },
            { title: 'Who Checks', dataIndex: 'checker' },
            { title: 'Task Owner', dataIndex: 'taskOwner.githubId' },
            {
              title: 'Actions',
              dataIndex: 'actions',
              render: (_, record: CourseTask) => (
                <>
                  <span>
                    <a onClick={() => this.handleEditItem(record)}>Edit</a>{' '}
                  </span>
                  {record.taskResultCount === 0 && (
                    <span className="ml-1 mr-1">
                      <a onClick={() => this.handleDeleteItem(record.id)}>Delete</a>
                    </span>
                  )}
                </>
              ),
            },
          ]}
        />

        {this.renderModal()}
      </div>
    );
  }

  private renderModal() {
    const { getFieldDecorator: field } = this.props.form;
    const { tasks, stages } = this.state;
    const modalData = this.state.modalData as CourseTask;
    if (modalData == null) {
      return null;
    }
    return (
      <Modal
        visible={!!modalData}
        title="Course Task"
        okText="Save"
        onOk={this.handleModalSubmit}
        onCancel={() => this.setState({ modalData: null })}
      >
        <Form layout="vertical">
          <Form.Item label="Task">
            {field<CourseTask>('taskId', {
              initialValue: modalData.taskId,
              rules: [{ required: true, message: 'Please select a task' }],
            })(
              <Select placeholder="Please select a task">
                {tasks.map((task: Task) => (
                  <Select.Option key={task.id} value={task.id}>
                    {task.name} {tagsRenderer(task.tags)}
                  </Select.Option>
                ))}
              </Select>,
            )}
          </Form.Item>
          <Form.Item label="Stage">
            {field<CourseTask>('stageId', {
              initialValue: modalData.stageId,
              rules: [{ required: true, message: 'Please select a stage' }],
            })(
              <Select placeholder="Please select a stage">
                {stages.map((stage: Stage) => (
                  <Select.Option key={stage.id} value={stage.id}>
                    {stage.name}
                  </Select.Option>
                ))}
              </Select>,
            )}
          </Form.Item>
          <Form.Item label="Task Owner">
            {field('taskOwnerId', {
              initialValue: modalData.taskOwner ? modalData.taskOwner.id : undefined,
              rules: [{ required: false, message: 'Please select a task owner' }],
            })(
              <UserSearch defaultValues={modalData.taskOwner ? [modalData.taskOwner] : []} searchFn={this.loadUsers} />,
            )}
          </Form.Item>
          <Form.Item label="TimeZone">
            {field('timeZone', {
              initialValue: DEFAULT_TIMEZONE,
            })(
              <Select placeholder="Please select a timezone">
                {Object.entries(TIMEZONES).map(tz => (
                  <Select.Option key={tz[0]} value={tz[0]}>
                    {tz[0]}
                  </Select.Option>
                ))}
              </Select>,
            )}
          </Form.Item>
          <Form.Item label="Start Date - End Date">
            {field('range', {
              initialValue:
                modalData.studentStartDate && modalData.studentEndDate
                  ? [
                      modalData.studentStartDate ? moment.tz(modalData.studentStartDate, DEFAULT_TIMEZONE) : null,
                      modalData.studentEndDate ? moment.tz(modalData.studentEndDate, DEFAULT_TIMEZONE) : null,
                    ]
                  : null,
              rules: [{ required: true, type: 'array', message: 'Please enter start and end date' }],
            })(<DatePicker.RangePicker format="YYYY-MM-DD HH:mm" showTime={{ format: 'HH:mm' }} />)}
          </Form.Item>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Max Score">
                {field('maxScore', {
                  initialValue: modalData.maxScore || 100,
                  rules: [{ required: true, message: 'Please enter max score' }],
                })(<InputNumber step={5} />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Score Weight">
                {field('scoreWeight', {
                  initialValue: modalData.scoreWeight || 1,
                  rules: [{ required: true, message: 'Please enter score weight' }],
                })(<InputNumber step={0.1} />)}
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Who Checks">
            {field('checker', { initialValue: modalData.checker || 'mentor' })(
              <Radio.Group>
                <Radio value="mentor">Mentor</Radio>
                <Radio value="assigned">Assigned</Radio>
                <Radio value="taskOwner">Task Owner</Radio>
              </Radio.Group>,
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }

  private loadUsers = async (searchText: string) => {
    return this.userService.searchUser(searchText);
  };

  private handleAddItem = () => this.setState({ modalData: {}, modalAction: 'create' });

  private handleEditItem = (record: CourseTask) => this.setState({ modalData: record, modalAction: 'update' });

  private handleDeleteItem = async (id: number) => {
    await this.courseService.deleteCourseTask(this.props.course.id, id);
    const courseTasks = await this.courseService.getCourseTasks();
    this.setState({ data: courseTasks });
  };
}

export default withCourseData(withSession(Form.create()(CourseTasksPage)));

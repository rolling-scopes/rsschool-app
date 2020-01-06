import { Button, Col, Form, Input, InputNumber, message, Select } from 'antd';
import { Header, withSession, StudentSearch } from 'components';
import withCourseData from 'components/withCourseData';
import * as React from 'react';
import { CourseService, CourseTask } from 'services/course';
import { sortTasksByEndDate } from 'services/rules';
import { CoursePageProps } from 'services/models';

type Props = CoursePageProps;

type State = {
  courseTasks: CourseTask[];
  isLoading: boolean;
  courseTaskId: number | null;
};

class TaskScorePage extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
    courseTasks: [],
    courseTaskId: null,
  };

  private courseService: CourseService;

  constructor(props: Props) {
    super(props);
    this.courseService = new CourseService(props.course.id);
  }

  async componentDidMount() {
    const courseTasks = (await this.courseService.getCourseTasks())
      .sort(sortTasksByEndDate)
      .filter(task => task.checker === 'jury');

    this.setState({ courseTasks });
  }

  render() {
    const { getFieldDecorator: field, getFieldValue } = this.props.form;
    const courseTaskId = getFieldValue('courseTaskId');
    const courseTask = this.state.courseTasks.find(t => t.id === courseTaskId);
    const maxScore = courseTask ? courseTask.maxScore || 100 : undefined;
    return (
      <>
        <Header
          title="Submit Review By Jury"
          courseName={this.props.course.name}
          username={this.props.session.githubId}
        />
        <Col className="m-2" sm={12}>
          <Form onSubmit={this.handleSubmit} layout="vertical">
            <Form.Item label="Task">
              {field('courseTaskId', { rules: [{ required: true, message: 'Please select a task' }] })(
                <Select size="large" placeholder="Select task" onChange={this.handleTaskChange}>
                  {this.state.courseTasks.map(task => (
                    <Select.Option key={task.id} value={task.id}>
                      {task.name}
                    </Select.Option>
                  ))}
                </Select>,
              )}
            </Form.Item>
            <Form.Item label="Student">
              {field('githubId', { rules: [{ required: true, message: 'Please select a student' }] })(
                <StudentSearch keyField="githubId" disabled={!courseTaskId} courseId={this.props.course.id} />,
              )}
            </Form.Item>
            <Form.Item label={`Score${maxScore ? ` (Max ${maxScore} points)` : ''}`}>
              {field('score', {
                rules: [
                  {
                    required: true,
                    message: 'Please enter task score',
                  },
                ],
              })(<InputNumber size="large" step={1} min={0} max={maxScore} />)}
            </Form.Item>
            <Form.Item label="Comment">{field('comment')(<Input.TextArea />)}</Form.Item>
            <Button size="large" type="primary" htmlType="submit">
              Submit
            </Button>
          </Form>
        </Col>
      </>
    );
  }

  private handleTaskChange = async (value: number) => {
    const courseTaskId = Number(value);
    const courseTask = this.state.courseTasks.find(t => t.courseTaskId === courseTaskId);
    if (courseTask == null) {
      return;
    }
    this.setState({ courseTaskId });
  };

  private handleSubmit = async (e: any) => {
    e.preventDefault();
    this.props.form.validateFields(async (err: any, values: any) => {
      if (err || this.state.isLoading) {
        return;
      }
      try {
        this.setState({ isLoading: true });

        const { githubId, courseTaskId, ...data } = values;
        await this.courseService.postStudentScore(githubId, courseTaskId, data);

        this.setState({ isLoading: false });
        message.success('Score has been submitted.');
        this.props.form.resetFields();
      } catch (e) {
        this.setState({ isLoading: false });
        message.error('An error occured. Please try later.');
      }
    });
  };
}

export default withCourseData(withSession(TaskScorePage));

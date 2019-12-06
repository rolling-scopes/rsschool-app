import { Button, Col, Form, Input, message, Select, InputNumber, Typography } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Header, GithubAvatar } from 'components';
import withCourseData from 'components/withCourseData';
import withSession, { Session } from 'components/withSession';
import * as React from 'react';
import { Course, CourseService } from 'services/course';
import { StudentBasic } from '../../../../../common/models';

type Props = {
  session: Session;
  course: Course;
} & FormComponentProps;

type State = {
  courseTaskId?: number;
  courseTasks: { id: number; name: string; maxScore: number | null }[];
  assignments: { student: StudentBasic; url: string }[];
};

class CrossCheckPage extends React.Component<Props, State> {
  state: State = {
    courseTasks: [],
    assignments: [],
  };

  private courseService: CourseService;

  constructor(props: Props) {
    super(props);
    this.courseService = new CourseService(props.course.id);
  }

  async componentDidMount() {
    try {
      const tasks = await this.courseService.getCourseTasks();
      const courseTasks = tasks.filter(t => t.checker === 'crossCheck');
      this.setState({ courseTasks });
    } catch (error) {
      console.error(error);
    }
  }

  handleSubmit = async (e: any) => {
    e.preventDefault();

    this.props.form.validateFields(async (err: any, values: any) => {
      if (err || !values.githubId) {
        return;
      }
      try {
        await this.courseService.postTaskSolutionResult(values.githubId, values.courseTaskId, {
          score: values.score,
          comment: values.comment,
        });
        message.success('The review has been submitted. Thanks!');
        this.props.form.resetFields();
      } catch (e) {
        message.error('An error occured. Please try later.');
      }
    });
  };

  private handleTaskChange = async (value: number) => {
    const courseTaskId = Number(value);
    const courseTask = this.state.courseTasks.find(t => t.id === courseTaskId);
    if (courseTask == null) {
      return;
    }
    const assignments = await this.courseService.getCrossCheckAssignments(this.props.session.githubId, courseTask.id);
    this.setState({ assignments, courseTaskId: courseTask.id });
  };

  render() {
    const { getFieldDecorator: field, getFieldValue } = this.props.form;
    const courseTaskId = getFieldValue('courseTaskId');
    const courseTask = this.state.courseTasks.find(t => t.id === courseTaskId);
    const maxScore = courseTask ? courseTask.maxScore || 100 : undefined;
    const assignment = this.state.assignments.find(({ student }) => student.githubId === getFieldValue('githubId'));
    return (
      <>
        <Header title="Cross-Check" username={this.props.session.githubId} courseName={this.props.course.name} />
        <Col className="m-2" sm={16} md={12} lg={8}>
          <Form onSubmit={this.handleSubmit} layout="vertical">
            <Form.Item label="Task">
              {field('courseTaskId', { rules: [{ required: true, message: 'Please select a task' }] })(
                <Select onChange={this.handleTaskChange}>
                  {this.state.courseTasks.map(t => (
                    <Select.Option value={t.id} key={t.id}>
                      {t.name}
                    </Select.Option>
                  ))}
                </Select>,
              )}
            </Form.Item>
            <Form.Item label="Student">
              {field('githubId', { rules: [{ required: true, message: 'Please select a student' }] })(
                <Select disabled={!this.state.courseTaskId}>
                  {this.state.assignments.map(({ student }) => (
                    <Select.Option key={student.githubId}>
                      <GithubAvatar size={24} githubId={student.githubId} /> {student.name} ({student.githubId})
                    </Select.Option>
                  ))}
                </Select>,
              )}
              <div style={{ marginTop: 16 }}>
                {assignment && (
                  <Typography.Text>
                    Solution: <a href={assignment.url}>{assignment.url}</a>
                  </Typography.Text>
                )}
              </div>
            </Form.Item>
            <Form.Item label={`Score${maxScore ? ` (Max ${maxScore} points)` : ''}`}>
              {field('score', {
                rules: [{ required: true, message: 'Please enter task score' }],
              })(<InputNumber size="large" step={1} min={0} max={maxScore} />)}
            </Form.Item>
            <Form.Item label="Comment">
              {field('comment', {
                rules: [{ required: true, message: 'Please leave a comment' }],
              })(<Input.TextArea rows={5} />)}
            </Form.Item>

            <Button size="large" type="primary" htmlType="submit">
              Submit
            </Button>
          </Form>
        </Col>
      </>
    );
  }
}

export default withCourseData(withSession(Form.create()(CrossCheckPage), 'student'));

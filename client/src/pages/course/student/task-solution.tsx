import { Button, Col, Row, Form, Input, message, Select, Typography, Icon, Comment, Divider } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Header } from 'components';
import withCourseData from 'components/withCourseData';
import withSession, { Session } from 'components/withSession';
import * as React from 'react';
import { CourseService } from 'services/course';
import { Course } from 'services/models';

import { urlPattern } from 'services/validators';

type Props = { session: Session; course: Course } & FormComponentProps;
type State = {
  courseTasks: { id: number; name: string; studentEndDate: string | null }[];
  feedback: { url?: string; comments?: { comment: string }[] } | null;
  courseTaskId: number | null;
};

class TaskSolutionPage extends React.Component<Props, State> {
  state: State = { courseTasks: [], feedback: null, courseTaskId: null };

  private courseService: CourseService;

  constructor(props: Props) {
    super(props);
    this.courseService = new CourseService(props.course.id);
  }

  async componentDidMount() {
    try {
      const tasks = await this.courseService.getCourseTasks();
      const courseTasks = tasks
        .filter(t => t.checker === 'crossCheck')
        .map(t => ({ id: t.id, name: t.name, studentEndDate: t.studentEndDate }));
      this.setState({ courseTasks });
    } catch (error) {
      console.error(error);
    }
  }

  handleSubmit = async (e: any) => {
    e.preventDefault();

    this.props.form.validateFields(async (err: any, values: any) => {
      if (err || !this.state.courseTaskId) {
        return;
      }
      try {
        await this.courseService.postTaskSolution(this.props.session.githubId, this.state.courseTaskId, values.url);
        message.success('The task solution has been submitted');
        this.props.form.resetFields();
      } catch (e) {
        message.error('An error occured. Please try later.');
      }
    });
  };

  render() {
    const { getFieldDecorator: field } = this.props.form;
    const comments = this.state.feedback?.comments ?? [];
    const hasComments = comments.length > 0;
    const task = this.state.courseTasks.find(task => task.id === this.state.courseTaskId);
    const studentEndDate = task?.studentEndDate ?? 0;
    const isSubmitDisabled = studentEndDate ? new Date(studentEndDate).getTime() < Date.now() : false;
    return (
      <>
        <Header title="Task Solution" username={this.props.session.githubId} courseName={this.props.course.name} />
        <Row style={{ margin: 16 }} gutter={24}>
          <Col sm={16} md={12} lg={8}>
            <Form onSubmit={this.handleSubmit} layout="vertical">
              <Form.Item label="Select a task">
                <Select value={this.state.courseTaskId!} onChange={this.handleTaskChange}>
                  {this.state.courseTasks.map(t => (
                    <Select.Option value={t.id} key={t.id}>
                      {t.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              {isSubmitDisabled && (
                <div>
                  <Typography.Text mark type="warning">
                    The deadline has passed already
                  </Typography.Text>
                </div>
              )}
              {!isSubmitDisabled && task && (
                <>
                  <Form.Item label="Solution URL">
                    <Typography.Text type="secondary">NOT link to Github repository or pull request</Typography.Text>
                    {field('url', {
                      rules: [{ required: true, pattern: urlPattern, message: 'Please enter a valid url' }],
                    })(<Input disabled={isSubmitDisabled} />)}
                  </Form.Item>
                  <Button size="large" type="primary" htmlType="submit">
                    Submit
                  </Button>
                </>
              )}
            </Form>
          </Col>
        </Row>
        {hasComments && (
          <Row>
            {comments.map(({ comment }, i) => (
              <div key={i}>
                <Divider />
                <Comment
                  style={{ margin: 16, fontStyle: 'italic' }}
                  author={`Student ${i + 1}`}
                  avatar={<Icon type="user" />}
                  key={i}
                  content={comment.split('\n').map((text, k) => (
                    <p key={k}>{text}</p>
                  ))}
                />
              </div>
            ))}
          </Row>
        )}
      </>
    );
  }

  public handleTaskChange = (value: number) => {
    this.setState({ feedback: null });
    const courseTaskId = Number(value);
    const courseTask = this.state.courseTasks.find(t => t.id === courseTaskId);
    if (courseTask == null) {
      return;
    }
    this.courseService.getCrossCheckFeedback(this.props.session.githubId, courseTask.id).then(feedback => {
      this.setState({ feedback, courseTaskId: courseTask.id });
    });
  };
}

export default withCourseData(withSession(Form.create()(TaskSolutionPage), 'student'));

import { Button, Col, Form, Input, message, Select } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Header } from 'components';
import withCourseData from 'components/withCourseData';
import withSession, { Session } from 'components/withSession';
import * as React from 'react';
import { Course, CourseService } from 'services/course';
import { urlPattern } from 'services/validators';

type Props = {
  session: Session;
  course: Course;
} & FormComponentProps;

type State = {
  courseTasks: { id: number; name: string }[];
};

class TaskSolutionPage extends React.Component<Props, State> {
  state: State = {
    courseTasks: [],
  };

  private courseService: CourseService;

  constructor(props: Props) {
    super(props);
    this.courseService = new CourseService(props.course.id);
  }

  async componentDidMount() {
    try {
      const tasks = await this.courseService.getCourseTasks();
      const courseTasks = tasks.filter(t => t.crossCheck).map(t => ({ id: t.id, name: t.name }));
      this.setState({ courseTasks });
    } catch (error) {
      console.error(error);
    }
  }

  handleSubmit = async (e: any) => {
    e.preventDefault();

    this.props.form.validateFields(async (err: any, values: any) => {
      if (err || !values.courseTaskId) {
        return;
      }
      try {
        await this.courseService.postTaskSolution(this.props.session.githubId, values.courseTaskId, values.url);
        message.success('The task solution has been submitted');
        this.props.form.resetFields();
      } catch (e) {
        message.error('An error occured. Please try later.');
      }
    });
  };

  render() {
    const { getFieldDecorator: field } = this.props.form;
    return (
      <>
        <Header title="Task Solution" username={this.props.session.githubId} courseName={this.props.course.name} />
        <Col className="m-2" sm={16} md={12} lg={8}>
          <Form onSubmit={this.handleSubmit} layout="vertical">
            <Form.Item label="Select a task">
              {field('courseTaskId')(
                <Select>
                  {this.state.courseTasks.map(t => (
                    <Select.Option value={t.id} key={t.id}>
                      {t.name}
                    </Select.Option>
                  ))}
                </Select>,
              )}
            </Form.Item>
            <Form.Item label="Solution URL">
              {field('url', {
                rules: [{ required: true, pattern: urlPattern, message: 'Please enter a valid url' }],
              })(<Input />)}
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

export default withCourseData(withSession(Form.create()(TaskSolutionPage), 'student'));

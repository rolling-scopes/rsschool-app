import { Button, Col, Form, message, Input, Select, Typography } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Header, withSession } from 'components';
import withCourseData from 'components/withCourseData';
import * as React from 'react';
import { CourseService, CourseTask } from 'services/course';
import { CoursePageProps } from 'services/models';
import { sortTasksByEndDate } from 'services/rules';

type Props = CoursePageProps & FormComponentProps;

type State = {
  courseTasks: CourseTask[];
  isLoading: boolean;
};

class TaskCheckerPage extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
    courseTasks: [],
  };

  courseService = new CourseService();

  async componentDidMount() {
    const courseId = this.props.course.id;
    const courseTasks = await this.courseService.getCourseTasks(courseId);

    const filteredCourseTasks = courseTasks
      .sort(sortTasksByEndDate)
      .filter(task => task.studentEndDate && task.verification === 'auto');

    this.setState({ courseTasks: filteredCourseTasks });
  }

  render() {
    const { getFieldDecorator: field, getFieldValue } = this.props.form;
    const courseTaskId = getFieldValue('courseTaskId');
    const task = this.state.courseTasks.find(t => t.courseTaskId === courseTaskId);
    return (
      <>
        <Header title="Check Task" courseName={this.props.course.name} username={this.props.session.githubId} />
        <Col className="m-2" sm={12}>
          <Form onSubmit={this.handleSubmit} layout="vertical">
            <Form.Item label="Task">
              {field('courseTaskId', { rules: [{ required: true, message: 'Please select a task' }] })(
                <Select size="large" placeholder="Select task">
                  {this.state.courseTasks.map(task => (
                    <Select.Option key={task.id} value={task.id}>
                      {task.name}
                    </Select.Option>
                  ))}
                </Select>,
              )}
            </Form.Item>
            {task && task.type === 'external' && (
              <div>
                <Form.Item label="Codecademy Account">{field('codecademy')(<Input />)}</Form.Item>
                <Form.Item label="Html Academy Account">{field('htmlacademy')(<Input />)}</Form.Item>
                <Form.Item label="Udemy: HTML/CSS Certificate Id ">{field('udemyHtml')(<Input />)}</Form.Item>
                <Form.Item label="Udemy: Web Certificate Id ">{field('udemyWeb')(<Input />)}</Form.Item>
              </div>
            )}
            {task && task.type === 'jstask' && (
              <>
                <Typography.Paragraph>
                  The system will run tests in the following repository and will update the score based on the result
                </Typography.Paragraph>
                <Typography.Paragraph>
                  <Typography.Text mark>
                    https://github.com/{this.props.session.githubId}/{task.githubRepoName}
                  </Typography.Text>
                </Typography.Paragraph>
              </>
            )}
            <Button size="large" type="primary" htmlType="submit">
              Submit
            </Button>
          </Form>
        </Col>
      </>
    );
  }

  private handleSubmit = async (e: any) => {
    e.preventDefault();
    this.props.form.validateFields(async (err: any, _: any) => {
      if (err) {
        return;
      }
      try {
        this.setState({ isLoading: true });
        // const courseId = this.props.course.id;
        // const { studentId, ...data } = values;

        this.setState({ isLoading: false });
        message.success('The reposiry has been submitted for verification and it will be checked soon.');
        this.props.form.resetFields();
      } catch (e) {
        this.setState({ isLoading: false });
        message.error('An error occured. Please try later.');
      }
    });
  };
}

export default withCourseData(withSession(Form.create()(TaskCheckerPage)));

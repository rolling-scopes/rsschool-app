import { Button, Col, Form, message, Input, Row, Select, Typography } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Header, withSession } from 'components';
import withCourseData from 'components/withCourseData';
import * as React from 'react';
import { CourseService, CourseTask } from 'services/course';
import { CoursePageProps } from 'services/models';
import { sortTasksByEndDate } from 'services/rules';
import { udemyCertificateId, notUrlPattern } from 'services/validators';

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
      .filter(
        task =>
          task.studentEndDate &&
          task.verification === 'auto' &&
          (task.type === 'externaltask' || task.type === 'jstask'),
      );

    this.setState({ courseTasks: filteredCourseTasks });
  }

  render() {
    const { getFieldDecorator: field, getFieldValue } = this.props.form;
    const courseTaskId = getFieldValue('courseTaskId');
    const task = this.state.courseTasks.find(t => t.courseTaskId === courseTaskId);
    return (
      <>
        <Header title="Submit Task" courseName={this.props.course.name} username={this.props.session.githubId} />
        <Form className="m-2" onSubmit={this.handleSubmit} layout="vertical">
          <Row gutter={24}>
            <Col xs={16} sm={12}>
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
            </Col>
          </Row>
          {task && task.type === 'externaltask' && (
            <>
              {task.descriptionUrl && (
                <Row>
                  <Typography.Paragraph>
                    <div>Description:</div>
                    <a href={task.descriptionUrl!} target="_blank">
                      {task.descriptionUrl}
                    </a>
                  </Typography.Paragraph>
                </Row>
              )}
              <Row gutter={24}>
                <Col xs={12} sm={8}>
                  <Form.Item label="Codecademy Account">
                    {field('codecademy', {
                      rules: [{ pattern: notUrlPattern, message: 'Enter valid Codecademy account' }],
                    })(<Input placeholder="username" />)}
                  </Form.Item>
                  <Form.Item label="Html Academy Account">
                    {field('htmlacademy', {
                      rules: [{ pattern: notUrlPattern, message: 'Enter valid HTML Academy account' }],
                    })(<Input placeholder="id1234567" />)}
                  </Form.Item>
                </Col>
                <Col xs={12} sm={8} key="2">
                  <Form.Item label="Udemy: Certificate Id 1">
                    {field('udemy1', {
                      rules: [{ pattern: udemyCertificateId, message: 'Enter valid Udemy Certificate Id (UC-XXXX)' }],
                    })(<Input placeholder="UC-xxxxxx" />)}
                  </Form.Item>
                  <Form.Item label="Udemy: Certificate Id 2">
                    {field('udemy2', {
                      rules: [{ pattern: udemyCertificateId, message: 'Enter valid Udemy Certificate Id (UC-XXXX)' }],
                    })(<Input placeholder="UC-xxxxxx" />)}
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}
          {task && task.type === 'jstask' && (
            <Row>
              <Typography.Paragraph>
                The system will run tests in the following repository and will update the score based on the result
              </Typography.Paragraph>
              <Typography.Paragraph>
                <Typography.Text mark>
                  https://github.com/{this.props.session.githubId}/{task.githubRepoName}
                </Typography.Text>
              </Typography.Paragraph>
            </Row>
          )}
          <Row>
            <Button size="large" type="primary" htmlType="submit">
              Submit
            </Button>
          </Row>
        </Form>
      </>
    );
  }

  private handleSubmit = async (e: any) => {
    e.preventDefault();
    this.props.form.validateFields(async (err: any, values: any) => {
      if (err) {
        return;
      }
      const { courseTaskId, ...other } = values;
      const courseId = this.props.course.id;
      const task = this.state.courseTasks.find(t => t.courseTaskId === courseTaskId);
      if (!task) {
        return;
      }
      try {
        let data: object = {};
        if (task.type === 'externaltask') {
          if (!values.codecademy && !values.htmlacademy && !values.udemy1 && !values.udemy2) {
            message.error('Enter any Account / Cerficate Id');
            return;
          }

          this.setState({ isLoading: true });
          data = {
            codecademy: other.codecademy,
            htmlacademy: other.htmlacademy,
            udemy: [other.udemy1, other.udemy2].filter(it => !!it),
          };
        } else if (task.type === 'jstask') {
          data = {
            githubRepoName: task.githubRepoName,
            sourceGithubRepoUrl: task.sourceGithubRepoUrl,
          };
        }

        await this.courseService.postTaskVerification(courseId, courseTaskId, data);
        this.setState({ isLoading: false });
        message.success('The task has been submitted for verification and it will be checked soon.');
        this.props.form.resetFields();
      } catch (e) {
        this.setState({ isLoading: false });
        message.error('An error occured. Please try later.');
      }
    });
  };
}

export default withCourseData(withSession(Form.create()(TaskCheckerPage)));

import { Button, Col, Form, message, Row, Table, Select, Typography, Spin } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { withSession } from 'components';
import withCourseData from 'components/withCourseData';
import * as React from 'react';
import { AxiosError } from 'axios';
import { CourseService, CourseTask } from 'services/course';
import { CoursePageProps } from 'services/models';

type Props = CoursePageProps & FormComponentProps;
type State = { courseTasks: (CourseTask & { score: number })[]; loading: boolean };

class PreCheckPage extends React.Component<Props, State> {
  state: State = { loading: true, courseTasks: [] };

  private courseService: CourseService;

  constructor(props: Props) {
    super(props);
    this.courseService = new CourseService(props.course.id);
  }

  async componentDidMount() {
    const studentScore = await this.courseService
      .getStudentScore(this.props.session.githubId)
      .catch((err: AxiosError) => {
        if (err.response?.status === 400) {
          document.location.href = '/registry/student?course=epamlearningjs';
        }
        return null;
      });
    const courseTasks = await this.courseService.getCourseTasks();

    this.setState({
      loading: false,
      courseTasks: courseTasks.map(courseTask => {
        const result = studentScore?.results.find(({ courseTaskId }) => courseTaskId === courseTask.id);
        return {
          ...courseTask,
          score: result?.score ?? 0,
        };
      }),
    });
  }

  render() {
    const { getFieldDecorator: field, getFieldValue } = this.props.form;
    const courseTaskId = getFieldValue('courseTaskId');
    const task = this.state.courseTasks.find(t => t.id === courseTaskId);
    if (this.state.courseTasks.length === 0) {
      return null;
    }
    return (
      <Spin spinning={this.state.loading}>
        <Form style={{ margin: 16 }} onSubmit={this.handleSubmit} layout="vertical">
          <Row align="bottom" gutter={24}>
            <Col style={{ marginBottom: 32 }} xs={24} sm={12} md={12} lg={10}>
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
              {task && (
                <>
                  <Typography.Paragraph>
                    The system will run tests in the following repository and will update the score based on the result
                  </Typography.Paragraph>
                  <Typography.Paragraph>
                    <Typography.Text mark>
                      https://github.com/{this.props.session.githubId}/{task.githubRepoName}
                    </Typography.Text>
                  </Typography.Paragraph>
                  <Typography.Paragraph type="danger">
                    IMPORTANT: Tests are run using NodeJS 10. Please make sure your solution works in NodeJS 10.
                  </Typography.Paragraph>
                </>
              )}
              <Button size="large" type="primary" htmlType="submit">
                Submit
              </Button>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12}>
              <Table
                dataSource={this.state.courseTasks}
                pagination={false}
                columns={[
                  {
                    title: 'Name',
                    dataIndex: 'name',
                  },
                  {
                    title: 'Score',
                    dataIndex: 'score',
                    width: 80,
                    align: 'right',
                  },
                ]}
                size="small"
              />
            </Col>
          </Row>
        </Form>
      </Spin>
    );
  }

  private handleSubmit = async (e: any) => {
    e.preventDefault();
    this.props.form.validateFields(async (err: any, values: any) => {
      if (err) {
        return;
      }
      const { courseTaskId } = values;
      const courseId = this.props.course.id;
      const task = this.state.courseTasks.find(t => t.id === courseTaskId);
      if (!task) {
        return;
      }
      try {
        const data = {
          githubRepoName: task.githubRepoName,
          sourceGithubRepoUrl: task.sourceGithubRepoUrl,
        };
        await this.courseService.postTaskVerification(courseId, courseTaskId, data);
        this.setState({ loading: false });
        message.success('The task has been submitted for verification and it will be checked soon.');
        this.props.form.resetFields();
      } catch (e) {
        this.setState({ loading: false });
        message.error('An error occured. Please try later.');
      }
    });
  };
}

export default withCourseData(withSession(Form.create()(PreCheckPage)), 15);

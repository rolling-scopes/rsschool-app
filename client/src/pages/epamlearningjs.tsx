import { Button, Col, Form, message, Row, Table, Typography, Spin } from 'antd';
import { NextPageContext } from 'next';
import { withSession } from 'components';
import * as React from 'react';
import { AxiosError } from 'axios';
import { CourseService, CourseTask } from 'services/course';
import { UserService } from 'services/user';
import { CoursePageProps } from 'services/models';
import { CourseTaskSelect } from 'components/Forms';

type Props = CoursePageProps;
type State = { courseTaskId: number | null; courseTasks: (CourseTask & { score: number })[]; loading: boolean };
const courseName = 'epamlearningjs';
const registryUrl = `/registry/epamlearningjs`;

class EpamLearningJs extends React.Component<Props, State> {
  state: State = { loading: true, courseTasks: [], courseTaskId: null };

  private courseService: CourseService;

  constructor(props: Props) {
    super(props);
    this.courseService = new CourseService(props.course.id);
  }

  static async getInitialProps(ctx: NextPageContext) {
    try {
      const courses = await new UserService(ctx).getCourses();
      const course = courses.find(c => c.alias === courseName) || null;
      if (course == null) {
        return EpamLearningJs.redirectToRegistry(ctx);
      }
      return { course };
    } catch (e) {
      console.error(e.message);
      return { course: null };
    }
  }

  static redirectToRegistry = (ctx: NextPageContext) => {
    ctx.res?.writeHead(302, { Location: registryUrl });
    ctx.res?.end();
    return {};
  };

  async componentDidMount() {
    const studentScore = await this.courseService
      .getStudentScore(this.props.session.githubId)
      .catch((err: AxiosError) => {
        if (err.response?.status === 400) {
          document.location.href = registryUrl;
        }
        return null;
      });
    const courseTasks = await this.courseService.getCourseTasks();

    this.setState({
      loading: false,
      courseTasks: courseTasks
        .map(courseTask => {
          const result = studentScore?.results.find(({ courseTaskId }) => courseTaskId === courseTask.id);
          return { ...courseTask, score: result?.score ?? 0 };
        })
        .sort((a, b) => a.id - b.id),
    });
  }

  render() {
    const { courseTasks, loading } = this.state;
    const task = courseTasks.find(t => t.id === this.state.courseTaskId);
    return (
      <Spin spinning={loading}>
        <Form style={{ margin: 32 }} onFinish={this.handleSubmit} layout="vertical">
          <Row align="bottom" gutter={24}>
            <Col style={{ marginBottom: 32 }} xs={24} sm={12} md={12} lg={10}>
              <CourseTaskSelect data={courseTasks} onChange={courseTaskId => this.setState({ courseTaskId })} />
              {task && (
                <>
                  <Typography.Paragraph>
                    Task Description:
                    <Button type="link" target="_blank" href={task.descriptionUrl!}>
                      {task.descriptionUrl}
                    </Button>
                  </Typography.Paragraph>
                  <Typography.Paragraph>
                    The system will run tests in the following repository and will update the score based on the result
                  </Typography.Paragraph>
                  <Typography.Paragraph>
                    <Typography.Text mark>
                      https://github.com/{this.props.session.githubId}/{task.githubRepoName}
                    </Typography.Text>
                  </Typography.Paragraph>
                  <Typography.Paragraph type="warning">
                    IMPORTANT: Tests are run using NodeJS 14. Please make sure your solution works in NodeJS 14.
                  </Typography.Paragraph>
                </>
              )}
              <Button size="large" type="primary" htmlType="submit">
                Submit
              </Button>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12}>
              <Table
                dataSource={courseTasks}
                pagination={false}
                size="small"
                rowKey="id"
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
              />
            </Col>
          </Row>
        </Form>
      </Spin>
    );
  }

  private handleSubmit = async (values: any) => {
    if (!this.props.course) {
      return;
    }

    const { courseTaskId } = values;
    const task = this.state.courseTasks.find(t => t.id === courseTaskId);
    if (!task) {
      return;
    }
    try {
      const data = {
        githubRepoName: task.githubRepoName,
        sourceGithubRepoUrl: task.sourceGithubRepoUrl,
      };
      await this.courseService.postTaskVerification(courseTaskId, data);
      this.setState({ loading: false });
      message.success('The task has been submitted for verification and it will be checked soon.');
    } catch (e) {
      this.setState({ loading: false });
      message.error('An error occured. Please try later.');
    }
  };
}

const Page = withSession(EpamLearningJs);
(Page as any).getInitialProps = EpamLearningJs.getInitialProps;
(Page as any).redirectToRegistry = EpamLearningJs.redirectToRegistry;
export default Page;

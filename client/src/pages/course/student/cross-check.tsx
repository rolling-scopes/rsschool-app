import { Button, Col, Form, Input, message, Select, Icon, Spin, InputNumber, Typography, Timeline } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Header, GithubAvatar } from 'components';
import withCourseData from 'components/withCourseData';
import withSession, { Session } from 'components/withSession';
import * as React from 'react';
import { Course, CourseService } from 'services/course';
import { StudentBasic } from '../../../../../common/models';
import { formatDateTime } from 'services/formatter';

type Props = { session: Session; course: Course } & FormComponentProps;

type State = {
  courseTaskId?: number;
  courseTasks: { id: number; name: string; maxScore: number | null }[];
  assignments: { student: StudentBasic; url: string }[];
  history: any[];
  historyLoading: boolean;
};

class CrossCheckPage extends React.Component<Props, State> {
  state: State = {
    courseTasks: [],
    assignments: [],
    history: [],
    historyLoading: false,
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
        await this.loadStudentScoreHistory(values.githubId);
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

  private loadStudentScoreHistory = async (githubId: string) => {
    this.setState({ historyLoading: true, history: [] });
    const result = await this.courseService.getTaskSolutionResult(githubId, this.state.courseTaskId!);
    this.setState({
      historyLoading: false,
      history: result?.historicalScores.sort((a, b) => b.dateTime - a.dateTime) ?? [],
    });
  };

  render() {
    const { getFieldDecorator: field, setFieldsValue, getFieldValue } = this.props.form;
    const courseTaskId = getFieldValue('courseTaskId');
    const courseTask = this.state.courseTasks.find(t => t.id === courseTaskId);
    const maxScore = courseTask ? courseTask.maxScore || 100 : undefined;
    const assignment = this.state.assignments.find(({ student }) => student.githubId === getFieldValue('githubId'));
    return (
      <>
        <Header title="Cross-Check" username={this.props.session.githubId} courseName={this.props.course.name} />
        <Col style={{ margin: 16 }} sm={18} md={14} lg={10}>
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
                <Select
                  onChange={(githubId: string) => {
                    setFieldsValue({ githubId });
                    this.loadStudentScoreHistory(githubId);
                  }}
                  disabled={!this.state.courseTaskId}
                >
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

            {this.state.history.length ? (
              <Spin spinning={this.state.historyLoading}>
                <Typography.Title style={{ marginTop: 24 }} level={4}>
                  History
                </Typography.Title>
                <Timeline>
                  {this.state.history.map((historyItem, i) => (
                    <Timeline.Item
                      key={i}
                      color={i === 0 ? 'green' : 'gray'}
                      dot={<Icon type="clock-circle-o" style={{ fontSize: '16px' }} />}
                    >
                      <div>{formatDateTime(historyItem.dateTime)}</div>
                      <div>
                        <Icon type="star" twoToneColor={i === 0 ? '#52c41a' : 'gray'} theme="twoTone" />{' '}
                        <Typography.Text>{historyItem.score}</Typography.Text>
                      </div>
                      <div>
                        <Typography.Text>
                          {historyItem.comment.split('\n').map((item, i) => (
                            <div key={i}>{item}</div>
                          ))}
                        </Typography.Text>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Spin>
            ) : null}
          </Form>
        </Col>
      </>
    );
  }
}

export default withCourseData(withSession(Form.create()(CrossCheckPage), 'student'));

import { ClockCircleOutlined, StarTwoTone } from '@ant-design/icons';
import { Button, Col, Form, message, Row, Spin, Timeline, Typography, Checkbox } from 'antd';
import { PageLayout, UserSearch } from 'components';
import { CommentInput, CourseTaskSelect, ScoreInput } from 'components/Forms';
import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { useEffect, useMemo, useState } from 'react';
import { CourseService, CourseTask } from 'services/course';
import { formatDateTime } from 'services/formatter';
import { CoursePageProps, StudentBasic } from 'services/models';
import CopyToClipboardButton from 'components/CopyToClipboardButton';
import { useAsync } from 'react-use';

type Assignment = { student: StudentBasic; url: string };
type HistoryItem = { comment: string; score: number; dateTime: number };
const colSizes = { xs: 24, sm: 18, md: 12, lg: 10 };

function CrossCheckHistory(props: { githubId: string | null; courseId: number; courseTaskId: number | null }) {
  if (props.githubId == null || props.courseTaskId == null) {
    return null;
  }
  const githubId = props.githubId;
  const courseTaskId = props.courseTaskId;

  const [state, setState] = useState({ loading: false, data: [] as HistoryItem[] });

  const loadStudentScoreHistory = async (githubId: string) => {
    const courseService = new CourseService(props.courseId);
    setState({ loading: true, data: [] });
    const result = await courseService.getTaskSolutionResult(githubId, courseTaskId);
    setState({ loading: false, data: result?.historicalScores.sort((a, b) => b.dateTime - a.dateTime) ?? [] });
  };

  useEffect(() => {
    loadStudentScoreHistory(githubId);
  }, [githubId]);

  return (
    <Spin spinning={state.loading}>
      <Typography.Title style={{ marginTop: 24 }} level={4}>
        History
      </Typography.Title>
      <Timeline>
        {state.data.map((historyItem, i) => (
          <Timeline.Item
            key={i}
            color={i === 0 ? 'green' : 'gray'}
            dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}
          >
            <div>{formatDateTime(historyItem.dateTime)}</div>
            <div>
              <StarTwoTone twoToneColor={i === 0 ? '#52c41a' : 'gray'} />{' '}
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
  );
}

function CrossCheckAssignmentLink({ assignment }: { assignment?: Assignment }) {
  if (!assignment) {
    return null;
  }
  const discordUsername = `@${assignment.student.discord}`;
  return (
    <div style={{ marginTop: 16 }}>
      <Typography.Paragraph>
        Student Discord:{' '}
        {assignment.student.discord ? (
          <>
            <Typography.Text strong>{discordUsername}</Typography.Text>{' '}
            <CopyToClipboardButton value={discordUsername} />
          </>
        ) : (
          'unknown'
        )}
      </Typography.Paragraph>
      <Typography.Paragraph>
        Solution:{' '}
        <a target="_blank" href={assignment.url}>
          {assignment.url}
        </a>
      </Typography.Paragraph>
    </div>
  );
}

function Page(props: CoursePageProps) {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [courseTaskId, setCourseTaskId] = useState(null as number | null);
  const [githubId, setGithubId] = useState(null as string | null);
  const [courseTasks, setCourseTasks] = useState([] as CourseTask[]);
  const [assignments, setAssignments] = useState([] as Assignment[]);

  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);

  useAsync(async () => {
    const data = await courseService.getCourseCrossCheckTasks();
    setCourseTasks(data);
  }, [courseService]);

  const handleSubmit = async (values: any) => {
    if (!values.githubId || loading) {
      return;
    }

    try {
      setLoading(true);
      await courseService.postTaskSolutionResult(values.githubId, values.courseTaskId, {
        score: values.score,
        comment: values.comment,
        anonymous: values.visibleName !== true,
        comments: [],
        review: [],
      });
      message.success('The review has been submitted. Thanks!');
      form.resetFields(['score', 'comment', 'githubId', 'visibleName']);
    } catch (e) {
      message.error('An error occured. Please try later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskChange = async (value: number) => {
    const courseTaskId = Number(value);
    const courseTask = courseTasks.find(t => t.id === courseTaskId);
    if (courseTask == null) {
      return;
    }
    const assignments = await courseService.getCrossCheckAssignments(props.session.githubId, courseTask.id);
    setAssignments(assignments);
    setCourseTaskId(courseTask.id);
    setGithubId(null);
    form.resetFields(['githubId']);
  };

  const handleStudentChange = (githubId: string) => {
    setGithubId(githubId as string);
    form.setFieldsValue({ githubId });
  };

  const courseTask = courseTasks.find(t => t.id === courseTaskId);
  const assignment = assignments.find(({ student }) => student.githubId === form.getFieldValue('githubId'));

  return (
    <PageLayout loading={loading} title="Cross-Check" githubId={props.session.githubId} courseName={props.course.name}>
      <Row gutter={24} style={{ margin: 16 }}>
        <Col {...colSizes}>
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <CourseTaskSelect data={courseTasks} onChange={handleTaskChange} />
            <Form.Item name="githubId" label="Student" rules={[{ required: true, message: 'Please select a student' }]}>
              <UserSearch
                keyField="githubId"
                onChange={handleStudentChange}
                disabled={!courseTaskId}
                defaultValues={assignments.map(({ student }) => student)}
              />
              <CrossCheckAssignmentLink assignment={assignment} />
            </Form.Item>
            <ScoreInput courseTask={courseTask} />
            <CommentInput />
            <Form.Item valuePropName="checked" name="visibleName">
              <Checkbox>Make my name visible in feedback</Checkbox>
            </Form.Item>
            <Button size="large" type="primary" htmlType="submit">
              Submit
            </Button>
          </Form>
        </Col>
        <Col {...colSizes}>
          <CrossCheckHistory githubId={githubId} courseId={props.course.id} courseTaskId={courseTaskId} />
        </Col>
      </Row>
    </PageLayout>
  );
}

export default withCourseData(withSession(Page, 'student'));

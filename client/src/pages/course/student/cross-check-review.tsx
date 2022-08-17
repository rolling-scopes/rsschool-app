import {
  ClockCircleOutlined,
  EyeInvisibleTwoTone,
  EyeInvisibleFilled,
  EyeTwoTone,
  EyeFilled,
  StarTwoTone,
  EditOutlined,
  EditFilled,
} from '@ant-design/icons';
import { Button, Checkbox, Col, Form, message, Row, Spin, Timeline, Typography } from 'antd';
import CopyToClipboardButton from 'components/CopyToClipboardButton';
import { CourseTaskSelect, ScoreInput } from 'components/Forms';
import MarkdownInput from 'components/Forms/MarkdownInput';
import PreparedComment, { markdownLabel } from 'components/Forms/PreparedComment';
import { PageLayout } from 'components/PageLayout';
import { UserSearch } from 'components/UserSearch';
import withCourseData from 'components/withCourseData';
import withSession, { CourseRole } from 'components/withSession';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { useAsync, useLocalStorage } from 'react-use';
import { CourseService } from 'services/course';
import { formatDateTime } from 'services/formatter';
import { CoursePageProps, StudentBasic } from 'services/models';
import { CrossCheckStatus } from 'services/course';

enum LocalStorage {
  IsUsernameVisible = 'crossCheckIsUsernameVisible',
}

type Assignment = { student: StudentBasic; url: string };
type HistoryItem = { comment: string; score: number; dateTime: number; anonymous: boolean };
const colSizes = { xs: 24, sm: 18, md: 12, lg: 10 };

function CrossCheckHistory(props: {
  githubId: string | null;
  courseId: number;
  courseTaskId: number | null;
  setHistoricalCommentSelected: Dispatch<SetStateAction<string>>;
}) {
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

  const handleClickAmendButton = (historicalComment: string) => {
    const commentWithoutMarkdownLabel = historicalComment.slice(markdownLabel.length);
    props.setHistoricalCommentSelected(commentWithoutMarkdownLabel);
  };

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
              {historyItem.anonymous ? (
                <>
                  <EyeInvisibleTwoTone twoToneColor={i === 0 ? '#1890ff' : 'gray'} />{' '}
                  <Typography.Text>Your name is hidden</Typography.Text>
                </>
              ) : (
                <>
                  <EyeTwoTone twoToneColor={i === 0 ? '#1890ff' : 'gray'} />{' '}
                  <Typography.Text>Your name is visible</Typography.Text>
                </>
              )}
              <Typography.Text>{}</Typography.Text>
            </div>
            <div>
              <PreparedComment text={historyItem.comment} />
            </div>
            <div>
              <Button
                size="middle"
                type={i === 0 ? 'primary' : 'default'}
                htmlType="button"
                icon={i === 0 ? <EditFilled /> : <EditOutlined />}
                onClick={() => handleClickAmendButton(historyItem.comment)}
              >
                Amend
              </Button>
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

  const {
    student: { discord },
    url: solutionUrl,
  } = assignment;

  const discordUsername = discord ? `@${discord.username}#${discord.discriminator}` : null;

  return (
    <div style={{ marginTop: 16 }}>
      <Typography.Paragraph>
        Student Discord:{' '}
        {discordUsername ? (
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
        <a target="_blank" href={solutionUrl}>
          {solutionUrl}
        </a>
      </Typography.Paragraph>
    </div>
  );
}

function Page(props: CoursePageProps) {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState<boolean>(false);
  const [courseTaskId, setCourseTaskId] = useState<number | null>(null);
  const [githubId, setGithubId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissionDisabled, setSubmissionDisabled] = useState<boolean>(true);
  const [historicalCommentSelected, setHistoricalCommentSelected] = useState<string>(form.getFieldValue('comment'));
  const [isUsernameVisible = false, setIsUsernameVisible] = useLocalStorage<boolean>(LocalStorage.IsUsernameVisible);

  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);

  const { value: courseTasks = [] } = useAsync(() => courseService.getCourseCrossCheckTasks(), [props.course.id]);

  useEffect(() => {
    if (historicalCommentSelected !== '') {
      form.setFieldsValue({ comment: historicalCommentSelected });
      setHistoricalCommentSelected('');
    }
  }, [historicalCommentSelected]);

  const handleSubmit = async (values: any) => {
    if (!values.githubId || loading) {
      return;
    }

    try {
      setLoading(true);
      await courseService.postTaskSolutionResult(values.githubId, values.courseTaskId, {
        score: values.score,
        comment: markdownLabel + values.comment,
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
    const submissionDisabled = courseTask.crossCheckStatus !== CrossCheckStatus.Distributed;
    setAssignments(assignments);
    setCourseTaskId(courseTask.id);
    setSubmissionDisabled(submissionDisabled);
    setGithubId(null);
    form.resetFields(['githubId']);
  };

  const handleStudentChange = (githubId: string) => {
    setGithubId(githubId as string);
    form.setFieldsValue({ githubId });
  };

  const handleUsernameVisibilityChange = () => {
    setIsUsernameVisible(!isUsernameVisible);
  };

  const courseTask = courseTasks.find(t => t.id === courseTaskId);
  const assignment = assignments.find(({ student }) => student.githubId === form.getFieldValue('githubId'));

  return (
    <PageLayout loading={loading} title="Cross-Check" githubId={props.session.githubId} courseName={props.course.name}>
      <Row gutter={24}>
        <Col {...colSizes}>
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <CourseTaskSelect data={courseTasks} groupBy="deadline" onChange={handleTaskChange} />
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
            <MarkdownInput historicalCommentSelected={historicalCommentSelected} />
            <Form.Item name="visibleName" valuePropName="checked" initialValue={isUsernameVisible}>
              <Checkbox onChange={handleUsernameVisibilityChange}>Make my name visible in feedback</Checkbox>
            </Form.Item>
            {isUsernameVisible ? (
              <Button size="large" type="primary" htmlType="submit" icon={<EyeFilled />} disabled={submissionDisabled}>
                Submit review as {props.session.githubId}
              </Button>
            ) : (
              <Button
                size="large"
                type="primary"
                htmlType="submit"
                icon={<EyeInvisibleFilled />}
                disabled={submissionDisabled}
              >
                Submit review as Student1
              </Button>
            )}
          </Form>
        </Col>
        <Col {...colSizes}>
          <CrossCheckHistory
            githubId={githubId}
            courseId={props.course.id}
            courseTaskId={courseTaskId}
            setHistoricalCommentSelected={setHistoricalCommentSelected}
          />
        </Col>
      </Row>
    </PageLayout>
  );
}

export default withCourseData(withSession(Page, CourseRole.Student));

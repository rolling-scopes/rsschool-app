import {
  ClockCircleOutlined,
  EyeInvisibleTwoTone,
  EyeInvisibleFilled,
  EyeTwoTone,
  EyeFilled,
  EditOutlined,
  EditFilled,
} from '@ant-design/icons';
import { ScoreIcon } from 'components/Icons/ScoreIcon';
import { Button, Checkbox, Col, Form, message, Row, Spin, Timeline, Typography } from 'antd';
import { CourseTaskSelect } from 'components/Forms';
import MarkdownInput from 'components/Forms/MarkdownInput';
import PreparedComment, { markdownLabel } from 'components/Forms/PreparedComment';
import { AssignmentLink, CrossCheckAssignmentLink } from 'components/CrossCheck/CrossCheckAssignmentLink';
import { PageLayout } from 'components/PageLayout';
import { UserSearch } from 'components/UserSearch';
import withCourseData from 'components/withCourseData';
import withSession, { CourseRole } from 'components/withSession';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { useAsync, useLocalStorage } from 'react-use';
import { CourseService } from 'services/course';
import { formatDateTime } from 'services/formatter';
import { CoursePageProps } from 'services/models';
import { CrossCheckStatus } from 'services/course';
import { TaskService } from 'services/task';
import { useCriteriaState } from '../../../components/CrossCheck/hooks/useCriteriaState';
import {
  CrossCheckCriteriaForm,
  CrossCheckCriteriaData,
  ICommentState,
  ICountState,
} from '../../../components/CrossCheck/CrossCheckCriteriaForm';
import _ from 'lodash';
import { CrossCheckCriteriaModal } from 'components/CrossCheck/criteria/CrossCheckCriteriaModal';

enum LocalStorage {
  IsUsernameVisible = 'crossCheckIsUsernameVisible',
}

type HistoryItem = {
  comment: string;
  score: number;
  dateTime: number;
  anonymous: boolean;
  criteria: CrossCheckCriteriaData[];
};
const colSizes = { xs: 24, sm: 18, md: 12, lg: 10 };

function CrossCheckHistory(props: {
  state: { loading: boolean; data: HistoryItem[] };
  maxScore: number | undefined;
  setHistoricalCommentSelected: Dispatch<SetStateAction<string>>;
}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState<CrossCheckCriteriaData[] | null>(null);

  const showModal = (criteria: CrossCheckCriteriaData[]) => {
    setIsModalVisible(true);
    setModalData(criteria);
  };

  const handleClickAmendButton = (historicalComment: string) => {
    const commentWithoutMarkdownLabel = historicalComment.slice(markdownLabel.length);
    props.setHistoricalCommentSelected(commentWithoutMarkdownLabel);
  };

  return (
    <Spin spinning={props.state.loading}>
      <CrossCheckCriteriaModal
        modalInfo={modalData}
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
      />
      <Typography.Title style={{ marginTop: 24 }} level={4}>
        History
      </Typography.Title>
      <Timeline>
        {props.state.data.map((historyItem, i) => (
          <Timeline.Item
            key={i}
            color={i === 0 ? 'green' : 'gray'}
            dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}
          >
            <div>{formatDateTime(historyItem.dateTime)}</div>
            <div>
              <ScoreIcon maxScore={props.maxScore} score={historyItem.score} isOutdatedScore={!!i} />{' '}
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
            {!!historyItem.criteria.length && (
              <Button style={{ margin: '10px 0' }} onClick={() => showModal(historyItem.criteria)}>
                Show detailed feedback
              </Button>
            )}
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

function Page(props: CoursePageProps) {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState<boolean>(false);
  const [courseTaskId, setCourseTaskId] = useState<number | null>(null);
  const [githubId, setGithubId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<AssignmentLink[]>([]);
  const [submissionDisabled, setSubmissionDisabled] = useState<boolean>(true);
  const [historicalCommentSelected, setHistoricalCommentSelected] = useState<string>(form.getFieldValue('comment'));
  const [isUsernameVisible = false, setIsUsernameVisible] = useLocalStorage<boolean>(LocalStorage.IsUsernameVisible);
  const [state, setState] = useState({ loading: false, data: [] as HistoryItem[] });

  const [
    { countStar, penalty, criteriaData, score, criteriaComment },
    { setCountStar, setPenalty, setCriteriaData, setScore, setComment },
  ] = useCriteriaState();

  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const taskServise = new TaskService();

  const { value: courseTasks = [] } = useAsync(() => courseService.getCourseCrossCheckTasks(), [props.course.id]);

  const loadStudentScoreHistory = async (githubId: string) => {
    setState({ loading: true, data: [] });
    const result = await courseService.getTaskSolutionResult(githubId, courseTaskId as number);
    setState({ loading: false, data: result?.historicalScores.sort((a, b) => b.dateTime - a.dateTime) ?? [] });
    if (result !== null) {
      loadInitialCriteria(result.historicalScores[0]);
    }
  };

  const loadInitialCriteria = (data: HistoryItem) => {
    setScore(data.score);
    setCriteriaData(data.criteria);
    const newCountState = data.criteria
      .filter(item => item.type.toLowerCase() === 'subtask')
      .map(item => _.omit(item, ['text', 'index', 'textComment', 'type', 'max']));
    setCountStar(newCountState as ICountState[]);
    const newCommentState = data.criteria.map(item => _.omit(item, ['text', 'index', 'point', 'type', 'max']));
    setComment(newCommentState as ICommentState[]);
    const newPenalty = data.criteria
      .filter(item => item.type.toLowerCase() === 'penalty')
      .map(item => _.omit(item, ['text', 'index', 'textComment', 'type', 'max']));
    setPenalty(newPenalty as ICountState[]);
  };

  const checkPoints = () => criteriaData.filter(item => item.type.toLowerCase() === 'subtask').map(item => item.type);

  const notFilledCriteriaWarning = () =>
    message.warning(`You have not checked all the items (${countStar.length}/${checkPoints().length})`);

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

    if (checkPoints().length !== countStar.length) {
      return notFilledCriteriaWarning();
    }

    try {
      setLoading(true);
      const criteria = arrayForCrossCheckSubmit();
      criteria.map(item => {
        if (!item.point) {
          item.point = 0;
        }
      });
      await courseService.postTaskSolutionResult(values.githubId, values.courseTaskId, {
        score,
        comment: markdownLabel + values.comment,
        anonymous: values.visibleName !== true,
        comments: [],
        review: [],
        criteria,
      });
      message.success('The review has been submitted. Thanks!');
      form.resetFields(['score', 'comment', 'githubId', 'visibleName']);
      setCountStar([{ key: '', point: 0 }]);
      setComment([{ key: '', textComment: '' }]);
      setPenalty([{ key: '', point: 0 }]);
      setScore(0);
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
    const taskCriteriaData = await taskServise.getCriteriaForCourseTask(courseTask.taskId);
    setCriteriaData(taskCriteriaData ?? []);
    setSubmissionDisabled(submissionDisabled);
    setGithubId(null);
    form.resetFields(['githubId']);
  };

  const handleStudentChange = (githubId: string) => {
    setGithubId(githubId as string);
    form.setFieldsValue({ githubId });
    loadStudentScoreHistory(githubId);
  };

  const handleUsernameVisibilityChange = () => {
    setIsUsernameVisible(!isUsernameVisible);
  };

  const courseTask = courseTasks.find(t => t.id === courseTaskId);
  const maxScore = courseTask?.maxScore;
  const assignment = assignments.find(({ student }) => student.githubId === form.getFieldValue('githubId'));

  function arrayForCrossCheckSubmit() {
    const arrayPoints = countStar.concat(penalty);
    criteriaData?.forEach(item => {
      const arrayPoint = arrayPoints.find(point => point.key === item.key);
      const arrayComment = criteriaComment.find(comment => comment.key === item.key);
      if (arrayPoint) {
        item.point = arrayPoint.point;
      }
      if (arrayComment) {
        item.textComment = arrayComment.textComment;
      }
    });
    return criteriaData;
  }

  const maxScoreForTask = courseTasks.find(item => item.id === courseTaskId)?.maxScore as number;

  return (
    <PageLayout
      loading={loading}
      title="Cross-Check Review"
      githubId={props.session.githubId}
      courseName={props.course.name}
    >
      <Row gutter={24}>
        <Col {...colSizes}>
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <CourseTaskSelect data={courseTasks} groupBy="crossCheckDeadline" onChange={handleTaskChange} />
            <Form.Item name="githubId" label="Student" rules={[{ required: true, message: 'Please select a student' }]}>
              <UserSearch
                keyField="githubId"
                onChange={handleStudentChange}
                disabled={!courseTaskId}
                defaultValues={assignments.map(({ student }) => student)}
              />
              <CrossCheckAssignmentLink assignment={assignment} />
            </Form.Item>
            {!!githubId && (
              <CrossCheckCriteriaForm
                countStar={countStar}
                setCountStar={setCountStar}
                criteriaData={criteriaData}
                setTotalPoints={setScore}
                totalPoints={score}
                setPenalty={setPenalty}
                penalty={penalty}
                criteriaComment={criteriaComment}
                setComment={setComment}
                maxScoreForTask={maxScoreForTask}
              />
            )}
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
            state={state}
            maxScore={maxScore}
            setHistoricalCommentSelected={setHistoricalCommentSelected}
          />
        </Col>
      </Row>
    </PageLayout>
  );
}

export default withCourseData(withSession(Page, CourseRole.Student));

import { useRouter } from 'next/router';
import { EyeInvisibleFilled, EyeFilled } from '@ant-design/icons';
import { Button, Checkbox, Col, Form, message, Row } from 'antd';
import { CourseTaskSelect, ScoreInput } from 'components/Forms';
import MarkdownInput from 'components/Forms/MarkdownInput';
import { markdownLabel } from 'components/Forms/PreparedComment';
import { AssignmentLink, CrossCheckAssignmentLink } from 'components/CrossCheck/CrossCheckAssignmentLink';
import { CrossCheckHistory } from 'components/CrossCheck/CrossCheckHistory';
import { PageLayout } from 'components/PageLayout';
import { UserSearch } from 'components/UserSearch';
import withCourseData from 'components/withCourseData';
import withSession, { CourseRole } from 'components/withSession';
import { useEffect, useMemo, useState } from 'react';
import { useAsync, useLocalStorage } from 'react-use';
import { getQueryString } from 'utils/queryParams-utils';
import { CourseService, CrossCheckMessageAuthorRole, SolutionReviewType } from 'services/course';
import { CoursePageProps } from 'services/models';
import { CrossCheckStatus } from 'services/course';
import { TaskService } from 'services/task';
import { useCriteriaState } from '../../../components/CrossCheck/hooks/useCriteriaState';
import {
  CrossCheckCriteriaForm,
  CommentState,
  CountState,
  TaskType,
} from '../../../components/CrossCheck/CrossCheckCriteriaForm';
import { omit } from 'lodash';

enum LocalStorage {
  IsUsernameVisible = 'crossCheckIsUsernameVisible',
}

const colSizes = { xs: 24, sm: 18, md: 12, lg: 12, xl: 10 };

function Page(props: CoursePageProps) {
  const router = useRouter();
  const queryTaskId = router.query.taskId ? +router.query.taskId : null;
  const [form] = Form.useForm();

  const [loading, setLoading] = useState<boolean>(false);
  const [courseTaskId, setCourseTaskId] = useState<number | null>(queryTaskId);
  const [criteriaId, setCriteriaId] = useState<number | null>(null);
  const [githubId, setGithubId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<AssignmentLink[]>([]);
  const [submissionDisabled, setSubmissionDisabled] = useState<boolean>(true);
  const [historicalCommentSelected, setHistoricalCommentSelected] = useState<string>(form.getFieldValue('comment'));
  const [isUsernameVisible = false, setIsUsernameVisible] = useLocalStorage<boolean>(LocalStorage.IsUsernameVisible);
  const [state, setState] = useState({ loading: false, data: [] as SolutionReviewType[] });

  const [
    { countStar, penalty, criteriaData, score, criteriaComment },
    { setCountStar, setPenalty, setCriteriaData, setScore, setComment },
  ] = useCriteriaState();

  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const taskService = new TaskService();

  const { value: courseTasks = [] } = useAsync(() => courseService.getCourseCrossCheckTasks(), [props.course.id]);

  const loadStudentScoreHistory = async (githubId: string) => {
    setState({ loading: true, data: [] });

    const [taskCriteriaData, result] = await Promise.all([
      taskService.getCriteriaForCourseTask(criteriaId as number),
      courseService.getTaskSolutionResult(githubId, courseTaskId as number),
    ]);

    setCriteriaData(taskCriteriaData ?? []);
    resetCriterias();
    form.resetFields(['comment']);

    if (!result) {
      return setState({ loading: false, data: [] });
    }

    const sortedData = result.historicalScores.sort((a, b) => b.dateTime - a.dateTime);

    const messages = result.anonymous
      ? result.messages.map(message => ({
          ...message,
          author: message.role === CrossCheckMessageAuthorRole.Reviewer ? null : message.author,
        }))
      : result.messages;

    const solutionReviews = sortedData.map(({ dateTime, comment, score, anonymous, criteria }, index) => {
      return {
        dateTime,
        comment,
        score,
        criteria,
        id: result.id,
        author: !anonymous ? result.author : null,
        messages: index === 0 ? messages : [],
      };
    });

    const activeSolutionReview = solutionReviews[0];

    form.setFieldValue('comment', activeSolutionReview.comment.slice(markdownLabel.length));
    if (result !== null) {
      loadInitialCriteria(activeSolutionReview);
    }
    setState({ loading: false, data: solutionReviews ?? [] });
  };

  const loadInitialCriteria = (data: SolutionReviewType) => {
    setScore(data.score);
    if (!data.criteria) return;
    setCriteriaData(data.criteria);
    const newCountState = data.criteria
      .filter(item => item.type.toLowerCase() === TaskType.Subtask)
      .map(item => omit(item, ['text', 'index', 'textComment', 'type', 'max']));
    setCountStar(newCountState as CountState[]);
    const newCommentState = data.criteria.map(item => omit(item, ['text', 'index', 'point', 'type', 'max']));
    setComment(newCommentState as CommentState[]);
    const newPenalty = data.criteria
      .filter(item => item.type.toLowerCase() === TaskType.Penalty)
      .map(item => omit(item, ['text', 'index', 'textComment', 'type', 'max']));
    setPenalty(newPenalty as CountState[]);
  };

  const checkPoints = () => criteriaData.filter(item => item.type.toLowerCase() === 'subtask').map(item => item.type);

  const notFilledCriteriaWarning = () =>
    message.warning(`You have not checked all the items (${countStar.length}/${checkPoints().length})`);

  useEffect(() => {
    if (queryTaskId && courseTasks.length) {
      handleTaskChange(queryTaskId);
    }
  }, [queryTaskId, courseTasks]);

  useEffect(() => {
    if (historicalCommentSelected !== '') {
      form.setFieldsValue({ comment: historicalCommentSelected });
      setHistoricalCommentSelected('');
    }
  }, [historicalCommentSelected]);

  const resetCriterias = () => {
    setCountStar([]);
    setComment([]);
    setPenalty([]);
    setScore(undefined);
  };

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
        score: values.score,
        comment: markdownLabel + values.comment,
        anonymous: values.visibleName !== true,
        comments: [],
        review: [],
        criteria,
      });
      message.success('The review has been submitted. Thanks!');
      form.resetFields(['score', 'comment', 'githubId', 'visibleName']);
      resetCriterias();
    } catch (e) {
      message.error('An error occured. Please try later.');
    } finally {
      setLoading(false);
    }
  };

  function selectTask(value: number) {
    const query = { ...router.query, taskId: value };
    const url = `${router.route}${getQueryString(query)}`;
    router.replace(url);
  }

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
    setCriteriaId(courseTask.taskId);
    setSubmissionDisabled(submissionDisabled);
    setGithubId(null);
    form.resetFields(['score', 'comment', 'githubId']);
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
            <CourseTaskSelect
              data={courseTasks}
              groupBy="crossCheckDeadline"
              onChange={selectTask}
              defaultValue={courseTaskId}
            />
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
                totalPoints={score}
                setPenalty={setPenalty}
                penalty={penalty}
                criteriaComment={criteriaComment}
                setComment={setComment}
              />
            )}
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
                Submit review as Reviewer1
              </Button>
            )}
          </Form>
        </Col>
        <Col {...colSizes}>
          <CrossCheckHistory
            state={state}
            courseTaskId={courseTaskId}
            courseId={props.course.id}
            sessionId={props.session.id}
            sessionGithubId={props.session.githubId}
            maxScore={maxScore}
            setHistoricalCommentSelected={setHistoricalCommentSelected}
          />
        </Col>
      </Row>
    </PageLayout>
  );
}

export default withCourseData(withSession(Page, CourseRole.Student));

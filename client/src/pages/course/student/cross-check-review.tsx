import { EyeFilled, EyeInvisibleFilled } from '@ant-design/icons';
import { Button, Checkbox, Col, Form, message, Modal, Row, Typography } from 'antd';
import { TasksCriteriaApi } from 'api';
import { CourseTaskSelect } from 'components/Forms';
import MarkdownInput from 'components/Forms/MarkdownInput';
import { markdownLabel } from 'components/Forms/PreparedComment';
import { PageLayout } from 'components/PageLayout';
import { useLoading } from 'components/useLoading';
import { UserSearch } from 'components/UserSearch';
import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { CourseRole } from 'services/models';
import { AssignmentLink, CrossCheckAssignmentLink } from 'modules/CrossCheck/components/CrossCheckAssignmentLink';
import { CrossCheckCriteriaForm, TaskType } from 'modules/CrossCheck/components/CrossCheckCriteriaForm';
import { CrossCheckHistory } from 'modules/CrossCheck/components/CrossCheckHistory';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useAsync, useLocalStorage } from 'react-use';
import {
  CourseService,
  CrossCheckCriteriaData,
  CrossCheckMessageAuthorRole,
  CrossCheckStatus,
  SolutionReviewType,
} from 'services/course';
import { CoursePageProps } from 'services/models';
import { getQueryString } from 'utils/queryParams-utils';

enum LocalStorage {
  IsUsernameVisible = 'crossCheckIsUsernameVisible',
}

const { Text } = Typography;

const colSizes = { xs: 24, sm: 18, md: 12, lg: 12, xl: 10 };

const criteriaApi = new TasksCriteriaApi();

function Page(props: CoursePageProps) {
  const router = useRouter();
  const queryTaskId = router.query.taskId ? +router.query.taskId : null;
  const [form] = Form.useForm();

  const [loading, withLoading] = useLoading(false);
  const [modal, contextHolder] = Modal.useModal();
  const [courseTaskId, setCourseTaskId] = useState<number | null>(queryTaskId);
  const [criteriaId, setCriteriaId] = useState<number | null>(null);
  const [githubId, setGithubId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<AssignmentLink[]>([]);
  const [submissionDisabled, setSubmissionDisabled] = useState<boolean>(true);
  const [historicalCommentSelected, setHistoricalCommentSelected] = useState<string>(form.getFieldValue('comment'));
  const [isUsernameVisible = false, setIsUsernameVisible] = useLocalStorage<boolean>(LocalStorage.IsUsernameVisible);
  const [state, setState] = useState<{ loading: boolean; data: SolutionReviewType[] }>({
    loading: false,
    data: [],
  });

  const [criteriaData, setCriteriaData] = useState<CrossCheckCriteriaData[]>([]);
  const [score, setScore] = useState(0);
  const [isSkipped, setIsSkipped] = useState(false);

  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);

  const { value: courseTasks = [] } = useAsync(() => courseService.getCourseCrossCheckTasks(), [props.course.id]);

  const loadStudentScoreHistory = async (githubId: string) => {
    if (!criteriaId || !courseTaskId) return;

    setState({ loading: true, data: [] });

    const [{ data: taskCriteriaData }, result] = await Promise.all([
      criteriaApi.getTaskCriteria(criteriaId),
      courseService.getTaskSolutionResult(githubId, courseTaskId),
    ]);

    setCriteriaData(taskCriteriaData.criteria ?? []);
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

    const [activeSolutionReview] = solutionReviews;

    form.setFieldValue('comment', activeSolutionReview.comment.slice(markdownLabel.length));
    setScore(activeSolutionReview.score);
    if (activeSolutionReview.criteria) {
      setCriteriaData(activeSolutionReview.criteria);
    }
    setState({ loading: false, data: solutionReviews ?? [] });
  };

  const checkCriteriaWarning = () =>
    modal.confirm({
      okText: 'Back to review',
      content: <Text>You have not checked all the criteria and leave comments</Text>,
    });

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

  const submitReview = withLoading(async values => {
    try {
      await courseService.postTaskSolutionResult(values.githubId, values.courseTaskId, {
        score,
        comment: markdownLabel + values.comment,
        anonymous: values.visibleName !== true,
        comments: [],
        review: [],
        criteria: criteriaData,
      });
      message.success('The review has been submitted. Thanks!');
      form.resetFields(['comment', 'githubId', 'visibleName']);
      setScore(0);
      setCriteriaData([]);
      setState({ loading: false, data: [] });
    } catch (e) {
      message.error('An error occurred. Please try later.');
    }
  });

  const handleSubmit = async (values: any) => {
    if (!values.githubId || loading) {
      return;
    }

    const criteriaToSubmit = criteriaData.map(item => {
      if (item.type !== TaskType.Title && !item.point) {
        item.point = 0;
      }
      return item;
    });

    setCriteriaData(criteriaToSubmit);

    const isCriteriaPointsAndCommentsVerified = criteriaToSubmit
      .filter(criteria => criteria.type.toLowerCase() === TaskType.Subtask)
      .every(item => {
        return item.point === item.max ? true : item.textComment && item.textComment.length >= 10;
      });

    if (!isCriteriaPointsAndCommentsVerified && !isSkipped) {
      checkCriteriaWarning();
      return;
    }

    if (score !== 0) {
      await submitReview(values);
    } else {
      modal.confirm({
        onOk: () => submitReview(values),
        okText: 'Yes, submit',
        cancelText: 'Change score',
        content: <Text>Are you sure you want to submit a review with a score of 0 points?</Text>,
      });
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
    setState({ loading: false, data: [] });
    form.resetFields(['comment', 'githubId']);
  };

  const handleStudentChange = (githubId: string) => {
    setGithubId(githubId as string);
    setIsSkipped(false);
    form.setFieldsValue({ githubId });
    loadStudentScoreHistory(githubId);
  };

  const handleUsernameVisibilityChange = () => {
    setIsUsernameVisible(!isUsernameVisible);
  };

  const courseTask = courseTasks.find(t => t.id === courseTaskId);
  const maxScore = courseTask?.maxScore;
  const assignment = assignments.find(({ student }) => student.githubId === form.getFieldValue('githubId'));

  return (
    <PageLayout
      loading={loading}
      title="Cross-Check Review"
      githubId={props.session.githubId}
      courseName={props.course.name}
    >
      {contextHolder}
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
                maxScore={maxScore}
                score={score}
                setScore={setScore}
                criteriaData={criteriaData}
                setCriteriaData={setCriteriaData}
                initialData={state.data[0]}
                isSkipped={isSkipped}
                setIsSkipped={setIsSkipped}
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

export default withCourseData(withSession(Page, { requiredCourseRole: CourseRole.Student }));

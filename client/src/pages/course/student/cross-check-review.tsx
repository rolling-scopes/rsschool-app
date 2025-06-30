import { EyeFilled, EyeInvisibleFilled } from '@ant-design/icons';
import { Button, Checkbox, Col, Form, Modal, Row, Typography } from 'antd';
import {
  CrossCheckCriteriaDataDto,
  CrossCheckMessageDtoRoleEnum,
  CrossCheckSolutionReviewDto,
  CrossCheckStatusEnum,
  TasksCriteriaApi,
} from 'api';
import { CourseTaskSelect } from 'components/Forms';
import MarkdownInput from 'components/Forms/MarkdownInput';
import { markdownLabel } from 'components/Forms/PreparedComment';
import { PageLayout } from 'components/PageLayout';
import { useLoading } from 'components/useLoading';
import { UserSearch } from 'components/UserSearch';
import { SessionContext, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';
import { AssignmentLink, CrossCheckAssignmentLink } from 'modules/CrossCheck/components/CrossCheckAssignmentLink';
import { CrossCheckCriteriaForm } from 'modules/CrossCheck/components/CrossCheckCriteriaForm';
import { CrossCheckHistory } from 'modules/CrossCheck/components/CrossCheckHistory';
import { TaskType } from 'modules/CrossCheck/constants';
import { useRouter } from 'next/router';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useAsync, useLocalStorage } from 'react-use';
import { CourseService } from 'services/course';
import { CourseRole } from 'services/models';
import { getQueryString } from 'utils/queryParams-utils';
import { useMessage } from 'hooks';

enum LocalStorage {
  IsUsernameVisible = 'crossCheckIsUsernameVisible',
}

const { Text } = Typography;

const colSizes = { xs: 24, sm: 18, md: 12, lg: 12, xl: 10 };

const criteriaApi = new TasksCriteriaApi();

function Page() {
  const { message } = useMessage();
  const { course } = useActiveCourseContext();
  const session = useContext(SessionContext);
  const router = useRouter();
  const queryTaskId = router.query.taskId ? +router.query.taskId : null;
  const queryGithubId = router.query.githubId ?? null;
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
  const [state, setState] = useState<{ loading: boolean; data: CrossCheckSolutionReviewDto[] }>({
    loading: false,
    data: [],
  });

  const [criteriaData, setCriteriaData] = useState<CrossCheckCriteriaDataDto[]>([]);
  const [score, setScore] = useState(0);
  const [isSkipped, setIsSkipped] = useState(false);

  const courseService = useMemo(() => new CourseService(course.id), [course.id]);

  const { value: courseTasks = [] } = useAsync(() => courseService.getCourseCrossCheckTasks(), [course.id]);

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
          author: message.role === CrossCheckMessageDtoRoleEnum.Reviewer ? null : message.author,
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
    setup();

    async function setup() {
      if (queryTaskId && courseTasks.length) {
        await handleTaskChange(queryTaskId);
        if (queryGithubId) {
          await handleStudentChange(queryGithubId as string);
        }
      }
    }
  }, [queryTaskId, courseTasks.length, queryGithubId]);

  useEffect(() => {
    if (historicalCommentSelected !== '') {
      form.setFieldsValue({ comment: historicalCommentSelected });
      setHistoricalCommentSelected('');
    }
  }, [historicalCommentSelected]);

  const submitReview = withLoading(async values => {
    try {
      if (values.maxScore != null && values.maxScore < score) {
        message.error(`The score (${score}) exceeds the maximum score (${values.maxScore}) for the task.`);
        return;
      }
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
    } catch {
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
    const assignments = await courseService.getCrossCheckAssignments(session.githubId, courseTask.id);
    const submissionDisabled = courseTask.crossCheckStatus !== CrossCheckStatusEnum.Distributed;
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
    <PageLayout loading={loading} title="Cross-Check Review" showCourseName>
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
                value={githubId}
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
                Submit review as {session.githubId}
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
            courseId={course.id}
            sessionId={session.id}
            sessionGithubId={session.githubId}
            maxScore={maxScore}
            setHistoricalCommentSelected={setHistoricalCommentSelected}
          />
        </Col>
      </Row>
    </PageLayout>
  );
}

export default function () {
  return (
    <SessionProvider allowedRoles={[CourseRole.Student]}>
      <Page />
    </SessionProvider>
  );
}

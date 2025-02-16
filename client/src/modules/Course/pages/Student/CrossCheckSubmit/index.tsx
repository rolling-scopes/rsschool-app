import { useRequest } from 'ahooks';
import { Alert, Button, Checkbox, Col, Form, Input, message, Modal, Result, Row } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { Rule } from 'antd/lib/form';
import { CoursesTasksApi, CrossCheckFeedbackDto, CrossCheckMessageDtoRoleEnum, CrossCheckStatusEnum } from 'api';
import { CourseTaskSelect, ScoreInput } from 'components/Forms';
import { PageLayout } from 'components/PageLayout';
import { NoSubmissionAvailable } from 'modules/Course/components/NoSubmissionAvailable';
import { SessionContext, useActiveCourseContext } from 'modules/Course/contexts';
import { CriteriaForm } from 'modules/CrossCheck/components/CriteriaForm';
import { SolutionReview } from 'modules/CrossCheck/components/SolutionReview';
import { SolutionReviewSettingsPanel } from 'modules/CrossCheck/components/SolutionReviewSettingsPanel';
import { SubmittedStatus } from 'modules/CrossCheck/components/SubmittedStatus';
import { useSolutionReviewSettings } from 'modules/CrossCheck/hooks';
import { useRouter } from 'next/router';
import { useContext, useEffect, useMemo, useState } from 'react';
import { CourseService, CrossCheckComment, CrossCheckCriteria, CrossCheckReview, TaskSolution } from 'services/course';
import { githubPrUrl, privateRsRepoPattern, urlWithIpPattern } from 'services/validators';
import { getQueryString } from 'utils/queryParams-utils';

const colSizes = { xs: 24, sm: 18, md: 12, lg: 10 };

const createGithubInUrlRule = (githubId: string): Rule => {
  return {
    message: 'Your Github Username should be in the URL',
    required: true,
    pattern: new RegExp(`${githubId}`, 'i'),
  };
};

const validUrlRule: Rule = {
  required: true,
  pattern: urlWithIpPattern,
  message: 'Please provide a valid link (must start with `http://` or `https://`)',
};

const githubPrInUrlRule: Rule = {
  required: true,
  pattern: githubPrUrl,
  message: 'Link should be a valid GitHub Pull Request URL',
};

const notPrivateRsRepoRule: Rule = {
  validator: (_, value) => {
    if (privateRsRepoPattern.test(value)) {
      return Promise.reject("Please provide another link. Students can't see Pull Requests of private RS School repos");
    }
    return Promise.resolve();
  },
};

export function CrossCheckSubmit() {
  const session = useContext(SessionContext);
  const { course } = useActiveCourseContext();
  const [form] = Form.useForm();
  const courseService = useMemo(() => new CourseService(course.id), [course.id]);
  const teamDistributionApi = useMemo(() => new CoursesTasksApi(), []);
  const solutionReviewSettings = useSolutionReviewSettings();
  const [feedback, setFeedback] = useState<CrossCheckFeedbackDto | null>(null);
  const [submittedSolution, setSubmittedSolution] = useState(null as TaskSolution | null);
  const router = useRouter();
  const queryTaskId = router.query.taskId ? +router.query.taskId : null;
  const [courseTaskId, setCourseTaskId] = useState(queryTaskId);
  const [criteria, setCriteria] = useState([] as CrossCheckCriteria[]);
  const [comments, setComments] = useState([] as CrossCheckComment[]);
  const [newComments, setNewComments] = useState([] as CrossCheckComment[]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [submitDeadlinePassed, setSubmitDeadlinePassed] = useState<boolean>(false);

  const [authorId, setAuthorId] = useState<number | null>(null);

  const { data: courseTasks = [], loading } = useRequest(() => courseService.getCourseCrossCheckTasks('started'), {
    refreshDeps: [course.id],
  });

  useEffect(() => {
    if (loading) return;

    if (queryTaskId) {
      handleTaskChange(queryTaskId);
    }
  }, [loading, queryTaskId]);

  const handleSubmit = async (values: { url: string; review: CrossCheckReview[] }) => {
    if (!courseTaskId) {
      return;
    }
    try {
      await courseService.postTaskSolution(session.githubId, courseTaskId, values.url, values.review, newComments);
      message.success('The task solution has been submitted');
      form.resetFields();
      setComments([]);
      setCourseTaskId(null);
    } catch {
      message.error('An error occured. Please try later.');
    }
  };

  const handleCancellation = async () => {
    if (!courseTaskId) {
      return;
    }

    try {
      await courseService.deleteTaskSolution(session.githubId, courseTaskId);
      message.success('The task submission has been canceled');
      setIsModalVisible(false);
      form.resetFields();
      setSubmittedSolution(null);
      setCourseTaskId(null);
    } catch {
      message.error('An error occurred. Please try later.');
    }

    setButtonDisabled(true);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const cancelModal = () => {
    setIsModalVisible(false);
    setButtonDisabled(true);
  };

  const cancellationChange = (e: CheckboxChangeEvent) => setButtonDisabled(!e.target.checked);

  function selectTask(value: number) {
    const query = { ...router.query, taskId: value };
    const url = `${router.route}${getQueryString(query)}`;
    router.replace(url);
  }

  const handleTaskChange = async (value: number) => {
    setFeedback(null);
    const courseTaskId = Number(value);
    const courseTask = courseTasks.find(t => t.id === courseTaskId);
    if (courseTask == null) {
      return;
    }

    const [{ data: feedback }, submittedSolution, taskDetails] = await Promise.all([
      teamDistributionApi.getMyCrossCheckFeedbacks(course.id, courseTask.id),
      courseService.getCrossCheckTaskSolution(session.githubId, courseTask.id).catch(() => null),
      courseService.getCrossCheckTaskDetails(courseTask.id),
    ]);

    const review = submittedSolution?.review ?? [];
    const criteria = taskDetails?.criteria ?? [];
    const endDate = taskDetails?.studentEndDate ? new Date(taskDetails.studentEndDate) : null;
    const submitDeadlinePassed = Date.now() > (endDate ? endDate.getTime() : 0);

    form.setFieldsValue({ review });
    form.setFieldsValue({ score: calculateFinalScore(review, criteria) });
    form.setFieldsValue({ url: submittedSolution?.url });

    setFeedback(feedback);
    setSubmittedSolution(submittedSolution);
    setCourseTaskId(courseTask.id);
    setCriteria(criteria);
    setSubmitDeadlinePassed(submitDeadlinePassed);
    setComments(submittedSolution?.comments ?? []);
    setAuthorId(submittedSolution?.studentId ?? null);
  };

  const handleReviewChange = (review: CrossCheckReview[], comments: CrossCheckComment[]) => {
    form.setFieldsValue({ score: calculateFinalScore(review, criteria) });
    setNewComments(comments);
  };

  const task = courseTasks.find(task => task.id === courseTaskId);
  const maxScore = task?.maxScore;
  const taskExists = !!task;
  const submitAllowed = taskExists && !submitDeadlinePassed;
  const newCrossCheck = criteria.length > 0;
  const isCrossCheckCompleted = task?.crossCheckStatus === CrossCheckStatusEnum.Completed;
  const isCrossCheckOngoing = task?.crossCheckStatus === CrossCheckStatusEnum.Distributed;
  const hasReviews = !!feedback?.reviews?.length;

  return (
    <PageLayout loading={loading} title="Cross-Check Submit" showCourseName>
      <Row gutter={24}>
        <Col {...colSizes}>
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            {courseTasks.length > 0 && (
              <CourseTaskSelect
                data={courseTasks}
                groupBy="deadline"
                onChange={selectTask}
                defaultValue={courseTaskId}
              />
            )}
            {courseTasks.length === 0 && !loading && <NoSubmissionAvailable courseAlias={course.alias} />}
            <SubmittedStatus
              taskExists={taskExists}
              solution={submittedSolution}
              deadlinePassed={submitDeadlinePassed}
            />
            {submitAllowed && (
              <>
                <Form.Item
                  name="url"
                  label="Solution URL"
                  rules={[
                    validUrlRule,
                    notPrivateRsRepoRule,
                    ...(task.validations?.githubIdInUrl ? [createGithubInUrlRule(session.githubId)] : []),
                    ...(task.validations?.githubPrInUrl ? [githubPrInUrlRule] : []),
                  ]}
                >
                  <Input placeholder="link in the form of https://www.google.com" />
                </Form.Item>
                {task.submitText ? <Alert showIcon message={task.submitText} /> : null}
              </>
            )}
            {submitAllowed && newCrossCheck && (
              <Form.Item name="review">
                <CriteriaForm
                  authorId={authorId ?? 0}
                  onChange={handleReviewChange}
                  criteria={criteria}
                  comments={comments ?? []}
                  reviewComments={newComments ?? []}
                />
              </Form.Item>
            )}
            {submitAllowed && newCrossCheck && <ScoreInput courseTask={task} />}
            {submitAllowed && (
              <Row style={{ marginTop: 16 }}>
                <Col span={12}>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                </Col>
                {submittedSolution && (
                  <Col span={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button danger ghost onClick={showModal}>
                      Cancel Submit
                    </Button>
                    <Modal
                      title="Cancel submission"
                      open={isModalVisible}
                      onOk={handleCancellation}
                      onCancel={cancelModal}
                      okButtonProps={{ disabled: buttonDisabled }}
                    >
                      <Checkbox checked={!buttonDisabled} onChange={cancellationChange}>
                        Being of sound mind and body, do hereby declare that I want to cancel my submission
                      </Checkbox>
                    </Modal>
                  </Col>
                )}
              </Row>
            )}
          </Form>
        </Col>
      </Row>

      {submittedSolution && !hasReviews && (isCrossCheckCompleted || isCrossCheckOngoing) && (
        <Row gutter={24}>
          <Col {...colSizes}>
            <Result
              title={isCrossCheckCompleted ? 'No one has checked your work.' : 'No one has checked your work yet.'}
              status="404"
              extra={
                isCrossCheckCompleted && (
                  <Button type="link" target="_blank" href="https://docs.rs.school/#/en/cross-check-flow?id=appeal">
                    Check if you are eligible to appeal here.
                  </Button>
                )
              }
            />
          </Col>
        </Row>
      )}
      {hasReviews && (
        <Row style={{ margin: '8px 0' }}>
          <Col>
            <SolutionReviewSettingsPanel settings={solutionReviewSettings} />
          </Col>
        </Row>
      )}

      {feedback?.reviews?.map((review, index) => (
        <Row key={index}>
          <Col span={24}>
            <SolutionReview
              sessionId={session.id}
              sessionGithubId={session.githubId}
              courseId={course.id}
              reviewNumber={index}
              settings={solutionReviewSettings}
              courseTaskId={courseTaskId}
              review={review}
              isActiveReview={true}
              currentRole={CrossCheckMessageDtoRoleEnum.Student}
              maxScore={maxScore}
            />
          </Col>
        </Row>
      ))}
    </PageLayout>
  );
}

function calculateFinalScore(
  review: { percentage: number; criteriaId: string }[],
  criteria: CrossCheckCriteria[] = [],
) {
  return review.reduce((acc, r) => {
    const max = criteria.find(c => c.criteriaId === r.criteriaId)?.max ?? 0;
    return acc + Math.round(max * r.percentage);
  }, 0);
}

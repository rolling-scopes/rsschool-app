import { Button, Checkbox, Col, Form, Input, message, Modal, Row } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { CriteriaForm } from 'components/CrossCheck/CriteriaForm';
import { SubmittedStatus } from 'components/CrossCheck/SubmittedStatus';
import { CrossCheckComments } from 'components/CrossCheckComments';
import { CourseTaskSelect, ScoreInput } from 'components/Forms';
import { PageLayout } from 'components/PageLayout';
import { NoSubmissionAvailable } from 'modules/Course/components/NoSubmissionAvailable';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import {
  CourseService,
  CrossCheckComment,
  CrossCheckCriteria,
  CrossCheckReview,
  Feedback,
  TaskSolution,
} from 'services/course';
import { CoursePageProps } from 'services/models';
import { urlWithIpPattern } from 'services/validators';
import { getQueryString } from 'utils/queryParams-utils';

const colSizes = { xs: 24, sm: 18, md: 12, lg: 10 };

export function CrossCheckSubmit(props: CoursePageProps) {
  const [form] = Form.useForm();
  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
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

  const { value: courseTasks = [], loading } = useAsync(
    () => courseService.getCourseCrossCheckTasks('started'),
    [props.course.id],
  );

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
      await courseService.postTaskSolution(
        props.session.githubId,
        courseTaskId,
        values.url,
        values.review,
        newComments,
      );
      message.success('The task solution has been submitted');
      form.resetFields();
      setComments([]);
      setCourseTaskId(null);
    } catch (e) {
      message.error('An error occured. Please try later.');
    }
  };

  const handleCancellation = async () => {
    if (!courseTaskId) {
      return;
    }

    try {
      await courseService.deleteTaskSolution(props.session.githubId, courseTaskId);
      message.success('The task submission has been canceled');
      setIsModalVisible(false);
      form.resetFields();
      setSubmittedSolution(null);
      setCourseTaskId(null);
    } catch (e) {
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

    const [feedback, submittedSolution, taskDetails] = await Promise.all([
      courseService.getCrossCheckFeedback(props.session.githubId, courseTask.id),
      courseService.getCrossCheckTaskSolution(props.session.githubId, courseTask.id).catch(() => null),
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

  return (
    <PageLayout
      loading={loading}
      title="Cross-Check Submit"
      githubId={props.session.githubId}
      courseName={props.course.name}
    >
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
            {courseTasks.length === 0 && !loading && <NoSubmissionAvailable courseAlias={props.course.alias} />}
            <SubmittedStatus
              taskExists={taskExists}
              solution={submittedSolution}
              deadlinePassed={submitDeadlinePassed}
            />
            {submitAllowed && (
              <Form.Item
                name="url"
                label="Solution URL"
                rules={[
                  {
                    required: true,
                    pattern: urlWithIpPattern,
                    message: 'Please provide a valid link (must start with `http://` or `https://`)',
                  },
                ]}
              >
                <Input placeholder="link in the form of https://www.google.com" />
              </Form.Item>
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
                    <Button danger type="ghost" onClick={showModal}>
                      Cancel Submit
                    </Button>
                    <Modal
                      title="Cancel submission"
                      visible={isModalVisible}
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
      <Row>
        <CrossCheckComments feedback={feedback} maxScore={maxScore} />
      </Row>
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

import { Button, Col, Form, Input, message, Row } from 'antd';
import { PageLayout, CrossCheckComments } from 'components';
import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { CriteriaForm } from 'components/CrossCheck/CriteriaForm';
import { useMemo, useState } from 'react';
import {
  CourseService,
  CourseTask,
  TaskSolution,
  CrossCheckCriteria,
  CrossCheckComment,
  CrossCheckReview,
} from 'services/course';
import { CoursePageProps } from 'services/models';
import { urlWithIpPattern } from 'services/validators';
import { useAsync } from 'react-use';
import { CourseTaskSelect, ScoreInput } from 'components/Forms';
import { DeadlineInfo } from 'components/CrossCheck/DeadlineInfo';
import { SubmittedStatus } from 'components/CrossCheck/SubmittedStatus';

const colSizes = { xs: 24, sm: 18, md: 12, lg: 10 };

function Page(props: CoursePageProps) {
  const [form] = Form.useForm();
  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const [courseTasks, setCourseTasks] = useState([] as CourseTask[]);
  const [feedback, setFeedback] = useState(null as any);
  const [submittedSolution, setSubmittedSolution] = useState(null as TaskSolution | null);
  const [courseTaskId, setCourseTaskId] = useState(null as number | null);
  const [criteria, setCriteria] = useState([] as CrossCheckCriteria[]);
  const [reviewComments, setReviewComments] = useState([] as CrossCheckComment[]);

  useAsync(async () => {
    const data = await courseService.getCourseCrossCheckTasks();
    setCourseTasks(data);
  }, [props.course.id]);

  const handleSubmit = async (values: any) => {
    if (!courseTaskId) {
      return;
    }
    try {
      await courseService.postTaskSolution(
        props.session.githubId,
        courseTaskId,
        values.url,
        values.review,
        reviewComments,
      );
      message.success('The task solution has been submitted');
      form.resetFields();
      setReviewComments([]);
      setCourseTaskId(null);
    } catch (e) {
      message.error('An error occured. Please try later.');
    }
  };

  const handleTaskChange = async (value: number) => {
    setFeedback(null);
    const courseTaskId = Number(value);
    const courseTask = courseTasks.find(t => t.id === courseTaskId);
    if (courseTask == null) {
      return;
    }
    const [feedback, submittedSolution, taskDetails] = await Promise.all([
      courseService.getCrossCheckFeedback(props.session.githubId, courseTask.id),
      courseService.getTaskSolution(props.session.githubId, courseTask.id).catch(() => null),
      courseService.getCrossCheckTaskDetails(courseTask.id),
    ]);

    const review = submittedSolution?.review ?? [];
    const criteria = taskDetails?.criteria ?? [];

    form.setFieldsValue({ review });
    form.setFieldsValue({ score: calculateFinalScore(review, criteria) });
    form.setFieldsValue({ url: submittedSolution?.url });

    setFeedback(feedback);
    setSubmittedSolution(submittedSolution);
    setCourseTaskId(courseTask.id);
    setCriteria(criteria);
    setReviewComments(submittedSolution?.comments ?? []);
  };

  const handleReviewChange = (review: CrossCheckReview[], comments: CrossCheckComment[]) => {
    form.setFieldsValue({ score: calculateFinalScore(review, criteria) });
    setReviewComments(comments);
  };

  const comments = feedback?.comments ?? [];
  const task = courseTasks.find(task => task.id === courseTaskId);
  const studentEndDate = task?.studentEndDate ?? 0;
  const isSubmitDisabled = studentEndDate ? new Date(studentEndDate).getTime() < Date.now() : false;
  const submitAllowed = !isSubmitDisabled && task;
  const newCrossCheck = criteria.length > 0;

  return (
    <PageLayout
      loading={false}
      title="Cross-Check Submit"
      githubId={props.session.githubId}
      courseName={props.course.name}
    >
      <Row gutter={24}>
        <Col {...colSizes}>
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <CourseTaskSelect data={courseTasks} onChange={handleTaskChange} />
            <DeadlineInfo isSubmitDisabled={isSubmitDisabled} />
            <SubmittedStatus solution={submittedSolution} />

            {submitAllowed && (
              <Form.Item
                name="url"
                label="Solution URL"
                rules={[{ required: true, pattern: urlWithIpPattern, message: 'Please provide a valid link' }]}
              >
                <Input />
              </Form.Item>
            )}
            {submitAllowed && newCrossCheck && (
              <Form.Item name="review">
                <CriteriaForm onChange={handleReviewChange} criteria={criteria} comments={reviewComments ?? []} />
              </Form.Item>
            )}
            {submitAllowed && newCrossCheck && <ScoreInput courseTask={task} />}
            {submitAllowed && (
              <Button style={{ marginTop: 16 }} type="primary" htmlType="submit">
                Submit
              </Button>
            )}
          </Form>
        </Col>
      </Row>
      <Row>
        <CrossCheckComments comments={comments} />
      </Row>
    </PageLayout>
  );
}

export default withCourseData(withSession(Page, 'student'));

function calculateFinalScore(review: { percentage: number; criteriaId: string }[], criteria: CrossCheckCriteria[]) {
  return review?.reduce((acc, r) => {
    const max = criteria.find(c => c.criteriaId === r.criteriaId)?.max ?? 0;
    return acc + Math.round(max * r.percentage);
  }, 0);
}

import { Button, Col, Form, Input, message, Row, Modal, Checkbox } from 'antd';
import { CheckboxChangeEvent } from "antd/lib/checkbox";
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
  const [comments, setComments] = useState([] as CrossCheckComment[]);
  const [newComments, setNewComments] = useState([] as CrossCheckComment[]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);

  const [authorId, setAuthorId] = useState<number | null>(null);

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

  const cancellationChange = (e: CheckboxChangeEvent) => setButtonDisabled(!e.target.checked)

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

    form.setFieldsValue({ review });
    form.setFieldsValue({ score: calculateFinalScore(review, criteria) });
    form.setFieldsValue({ url: submittedSolution?.url });

    setFeedback(feedback);
    setSubmittedSolution(submittedSolution);
    setCourseTaskId(courseTask.id);
    setCriteria(criteria);
    setComments(submittedSolution?.comments ?? []);
    setAuthorId(submittedSolution?.studentId ?? null);
  };

  const handleReviewChange = (review: CrossCheckReview[], comments: CrossCheckComment[]) => {
    form.setFieldsValue({ score: calculateFinalScore(review, criteria) });
    setNewComments(comments);
  };

  const feedbackComments = feedback?.comments ?? [];
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
              <Row style={{marginTop: 16}}>
                <Col span={12}>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                </Col>
                {submittedSolution && (
                  <Col span={12} style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <Button danger type="ghost" onClick={showModal}>
                      Cancel Submit
                    </Button>
                    <Modal
                      title="Cancel submission"
                      visible={isModalVisible}
                      onOk={handleCancellation}
                      onCancel={cancelModal}
                      okButtonProps={{ disabled:  buttonDisabled  }}
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
        <CrossCheckComments comments={feedbackComments} />
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

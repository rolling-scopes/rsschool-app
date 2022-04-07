import { Button, Checkbox, Col, Form, message, Row } from 'antd';
import { PageLayout } from 'components/PageLayout';
import { UserSearch } from 'components/UserSearch';
import { CriteriaForm } from 'components/CrossCheck/CriteriaForm';
import { CrossCheckAssignmentLink, AssignmentLink } from 'components/CrossCheck/CrossCheckAssignmentLink';
import { CommentInput, CourseTaskSelect, ScoreInput } from 'components/Forms';
import withCourseData from 'components/withCourseData';
import withSession, { CourseRole } from 'components/withSession';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, CrossCheckComment, CrossCheckReview, CrossCheckCriteria } from 'services/course';
import { CoursePageProps } from 'services/models';
import { CrossCheckHistory } from 'components/CrossCheck/CrossCheckHistory';
import { CourseTaskDto } from 'api';

const colSizes = { xs: 24, sm: 18, md: 12, lg: 10 };

function Page(props: CoursePageProps) {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [courseTaskId, setCourseTaskId] = useState(null as number | null);
  const [githubId, setGithubId] = useState(null as string | null);
  const [courseTasks, setCourseTasks] = useState([] as CourseTaskDto[]);
  const [assignments, setAssignments] = useState([] as AssignmentLink[]);
  const [criteria, setCriteria] = useState([] as CrossCheckCriteria[]);
  const [comments, setComments] = useState([] as CrossCheckComment[]);
  const [reviewComments, setReviewComments] = useState([] as CrossCheckComment[]);
  const [selfReview, setSelfReview] = useState<CrossCheckReview[]>([]);
  const [authorId, setAuthorId] = useState<number | null>(null);

  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);

  useAsync(async () => {
    const courseTasks = await courseService.getCourseCrossCheckTasks();
    setCourseTasks(courseTasks);
  }, [courseService]);

  useAsync(async () => {
    if (!githubId || !courseTaskId) {
      return;
    }
    const [taskSolutionResult, taskDetails, taskSolution] = await Promise.all([
      courseService.getTaskSolutionResult(githubId, courseTaskId),
      courseService.getCrossCheckTaskDetails(courseTaskId),
      courseService.getCrossCheckTaskSolution(githubId, courseTaskId),
    ]);

    setComments(taskSolutionResult?.comments ?? taskSolution.comments ?? []);
    form.setFieldsValue({ review: taskSolutionResult?.review ?? [] });
    setCriteria(taskDetails?.criteria ?? []);
    setSelfReview(taskSolution.review ?? []);
    setAuthorId(taskSolutionResult?.checkerId ?? null);
  }, [courseService, githubId, courseTaskId]);

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
        review: values.review ?? [],
        comments: reviewComments,
      });
      message.success('The review has been submitted. Thanks!');
      form.resetFields(['score', 'comment', 'githubId', 'visibleName']);
      setGithubId(null);
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
            {githubId && (
              <Form.Item name="review">
                <CriteriaForm
                  onChange={(review, comments) => {
                    form.setFieldsValue({ score: calculateFinalScore(review, criteria) });
                    setReviewComments(comments);
                  }}
                  criteria={criteria}
                  comments={comments}
                  reviewComments={reviewComments}
                  selfReview={selfReview}
                  authorId={authorId ?? 0}
                />
              </Form.Item>
            )}
            {githubId && <ScoreInput courseTask={courseTask} />}
            {githubId && <CommentInput notRequired />}
            {githubId && (
              <Form.Item valuePropName="checked" name="visibleName">
                <Checkbox>Make my name visible in feedback</Checkbox>
              </Form.Item>
            )}
            <Button disabled={!githubId} size="large" type="primary" htmlType="submit">
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

export default withCourseData(withSession(Page, CourseRole.Student));

function calculateFinalScore(review: { percentage: number; criteriaId: string }[], criteria: CrossCheckCriteria[]) {
  return review?.reduce((acc, r) => {
    const max = criteria.find(c => c.criteriaId === r.criteriaId)?.max ?? 0;
    return acc + Math.round(max * r.percentage);
  }, 0);
}

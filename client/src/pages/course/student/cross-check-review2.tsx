import { Button, Checkbox, Col, Form, message, Row } from 'antd';
import { PageLayout, UserSearch } from 'components';
import { CriteriaForm } from 'components/CrossCheck/CriteriaForm';
import { CrossCheckAssignmentLink, AssignmentLink } from 'components/CrossCheck/CrossCheckAssignmentLink';
import { CommentInput, CourseTaskSelect, ScoreInput } from 'components/Forms';
import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, CourseTask, CrossCheckComment, CrossCheckCriteria } from 'services/course';
import { CoursePageProps } from 'services/models';

const colSizes = { xs: 24, sm: 18, md: 12, lg: 10 };

function Page(props: CoursePageProps) {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [courseTaskId, setCourseTaskId] = useState(null as number | null);
  const [githubId, setGithubId] = useState(null as string | null);
  const [courseTasks, setCourseTasks] = useState([] as CourseTask[]);
  const [assignments, setAssignments] = useState([] as AssignmentLink[]);
  const [criteria, setCriteria] = useState([] as CrossCheckCriteria[]);
  const [comments, setComments] = useState([] as CrossCheckComment[]);

  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);

  const resultEffect = useCallback(() => {
    const getResult = async () => {
      if (!githubId || !courseTaskId) {
        return;
      }
      const data = await courseService.getTaskSolutionResult(githubId, courseTaskId);
      setComments((data as any).comments);
      form.setFieldsValue({ review: (data as any).review ?? [] });
    };
    getResult();
  }, [githubId, courseTaskId, courseService]);

  useAsync(async () => {
    const data = await courseService.getCourseCrossCheckTasks();
    setCourseTasks(data);
  }, [courseService]);

  useEffect(resultEffect, [githubId, courseTaskId]);

  useEffect(() => {
    if (!courseTaskId) {
      return;
    }
    async function getData() {
      const data = await courseService.getCrossCheckTaskDetails(courseTaskId!);
      if (data) {
        setCriteria(data.criteria);
      }
    }
    getData();
  }, [courseTaskId]);

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
        comments,
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
                    setComments(comments);
                  }}
                  criteria={criteria}
                  comments={comments ?? []}
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

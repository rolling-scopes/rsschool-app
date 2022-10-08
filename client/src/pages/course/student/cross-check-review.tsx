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
import { CourseService } from 'services/course';
import { CoursePageProps } from 'services/models';
import { CrossCheckStatus } from 'services/course';

enum LocalStorage {
  IsUsernameVisible = 'crossCheckIsUsernameVisible',
}

const colSizes = { xs: 24, sm: 18, md: 12, lg: 10 };

function Page(props: CoursePageProps) {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState<boolean>(false);
  const [courseTaskId, setCourseTaskId] = useState<number | null>(null);
  const [githubId, setGithubId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<AssignmentLink[]>([]);
  const [submissionDisabled, setSubmissionDisabled] = useState<boolean>(true);
  const [historicalCommentSelected, setHistoricalCommentSelected] = useState<string>(form.getFieldValue('comment'));
  const [isUsernameVisible = false, setIsUsernameVisible] = useLocalStorage<boolean>(LocalStorage.IsUsernameVisible);

  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);

  const { value: courseTasks = [] } = useAsync(() => courseService.getCourseCrossCheckTasks(), [props.course.id]);

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

    try {
      setLoading(true);
      await courseService.postTaskSolutionResult(values.githubId, values.courseTaskId, {
        score: values.score,
        comment: markdownLabel + values.comment,
        anonymous: values.visibleName !== true,
        comments: [],
        review: [],
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
    const submissionDisabled = courseTask.crossCheckStatus !== CrossCheckStatus.Distributed;
    setAssignments(assignments);
    setCourseTaskId(courseTask.id);
    setSubmissionDisabled(submissionDisabled);
    setGithubId(null);
    form.resetFields(['githubId']);
  };

  const handleStudentChange = (githubId: string) => {
    setGithubId(githubId as string);
    form.setFieldsValue({ githubId });
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
                Submit review as Student1
              </Button>
            )}
          </Form>
        </Col>
        <Col {...colSizes}>
          <CrossCheckHistory
            sessionGithubId={props.session.githubId}
            courseId={props.course.id}
            githubId={githubId}
            courseTaskId={courseTaskId}
            maxScore={maxScore}
            setHistoricalCommentSelected={setHistoricalCommentSelected}
          />
        </Col>
      </Row>
    </PageLayout>
  );
}

export default withCourseData(withSession(Page, CourseRole.Student));

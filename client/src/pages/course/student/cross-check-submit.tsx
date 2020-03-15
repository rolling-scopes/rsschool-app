import { UserOutlined } from '@ant-design/icons';
import { Button, Col, Comment, Alert, Divider, Form, Input, message, Row, Typography } from 'antd';
import { PageLayout } from 'components';
import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { useMemo, useState } from 'react';
import { CourseService, CourseTask, TaskSolution } from 'services/course';
import { CoursePageProps } from 'services/models';
import { urlWithIpPattern } from 'services/validators';
import { useAsync } from 'react-use';
import { formatDate } from 'services/formatter';
import { CourseTaskSelect } from 'components/Forms';

const colSizes = { xs: 24, sm: 18, md: 12, lg: 10 };

function Page(props: CoursePageProps) {
  const [form] = Form.useForm();
  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const [courseTasks, setCourseTasks] = useState([] as CourseTask[]);
  const [feedback, setFeedback] = useState(null as any);
  const [submittedSolution, setSubmittedSolution] = useState(null as TaskSolution | null);
  const [courseTaskId, setCourseTaskId] = useState(null as number | null);

  useAsync(async () => {
    const data = await courseService.getCourseTasks();
    const courseTasks = data.filter(t => t.checker === 'crossCheck');
    setCourseTasks(courseTasks);
  }, [props.course.id]);

  const handleSubmit = async (values: any) => {
    if (!courseTaskId) {
      return;
    }
    try {
      await courseService.postTaskSolution(props.session.githubId, courseTaskId, values.url);
      message.success('The task solution has been submitted');
      form.resetFields();
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
    const [feedback, submittedSolution] = await Promise.all([
      courseService.getCrossCheckFeedback(props.session.githubId, courseTask.id),
      courseService.getTaskSolution(props.session.githubId, courseTask.id).catch(() => null),
    ]);
    setFeedback(feedback);
    setSubmittedSolution(submittedSolution);
    setCourseTaskId(courseTask.id);
  };

  const comments = feedback?.comments ?? [];
  const task = courseTasks.find(task => task.id === courseTaskId);
  const studentEndDate = task?.studentEndDate ?? 0;
  const isSubmitDisabled = studentEndDate ? new Date(studentEndDate).getTime() < Date.now() : false;
  const submitAllowed = !isSubmitDisabled && task;
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
            {renderDeadlineInfo(isSubmitDisabled)}
            {renderTaskSolutionStatus(submittedSolution)}
            {submitAllowed && (
              <Form.Item
                name="url"
                label="Solution URL"
                rules={[{ required: true, pattern: urlWithIpPattern, message: 'Please provide a valid link' }]}
              >
                <Input />
              </Form.Item>
            )}
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

function CrossCheckComments({ comments }: { comments: { comment: string }[] }) {
  if (!comments || comments.length === 0) {
    return null;
  }
  const style = { margin: 16, fontStyle: 'italic' };
  return (
    <Col>
      {comments.map(({ comment }, i) => (
        <Row key={i}>
          <Divider />
          <Comment
            style={style}
            author={`Student ${i + 1}`}
            avatar={<UserOutlined />}
            content={comment.split('\n').map((text, k) => (
              <p key={k}>{text}</p>
            ))}
          />
        </Row>
      ))}
    </Col>
  );
}

function renderDeadlineInfo(isSubmitDisabled: boolean) {
  return (
    isSubmitDisabled && (
      <div style={{ marginBottom: 16 }}>
        <Typography.Text mark type="warning">
          The deadline has passed already
        </Typography.Text>
      </div>
    )
  );
}

function renderTaskSolutionStatus(submittedSolution: TaskSolution | null) {
  return submittedSolution ? (
    <Alert
      message={
        <>
          Submitted{' '}
          <a target="_blank" href={submittedSolution.url}>
            {submittedSolution.url}
          </a>{' '}
          on {formatDate(submittedSolution.updatedDate)}.
        </>
      }
      type="success"
      showIcon
    />
  ) : null;
}

import { UserOutlined } from '@ant-design/icons';
import { Button, Col, Comment, Divider, Form, Input, message, Row, Select, Typography } from 'antd';
import { PageLayout } from 'components';
import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { useEffect, useMemo, useState } from 'react';
import { CourseService, CourseTask } from 'services/course';
import { CoursePageProps } from 'services/models';
import { urlPattern } from 'services/validators';

const colSizes = { xs: 24, sm: 18, md: 12, lg: 10 };

function CrossCheckComments({ comments }: { comments: { comment: string }[] }) {
  if (!comments || comments.length === 0) {
    return null;
  }
  return (
    <>
      {comments.map(({ comment }, i) => (
        <div key={i}>
          <Divider />
          <Comment
            style={{ margin: 16, fontStyle: 'italic' }}
            author={`Student ${i + 1}`}
            avatar={<UserOutlined />}
            key={i}
            content={comment.split('\n').map((text, k) => (
              <p key={k}>{text}</p>
            ))}
          />
        </div>
      ))}
    </>
  );
}

function Page(props: CoursePageProps) {
  const [form] = Form.useForm();
  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const [courseTasks, setCourseTasks] = useState([] as CourseTask[]);
  const [feedback, setFeedback] = useState(null as any);
  const [courseTaskId, setCourseTaskId] = useState(null as number | null);

  const dataEffect = () => {
    const getData = async () => {
      const data = await courseService.getCourseTasks();
      const courseTasks = data.filter(t => t.checker === 'crossCheck');
      setCourseTasks(courseTasks);
    };
    getData();
  };
  useEffect(dataEffect, [props.course.id]);

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
    const feedback = await courseService.getCrossCheckFeedback(props.session.githubId, courseTask.id);
    setFeedback(feedback);
    setCourseTaskId(courseTask.id);
  };

  const comments = feedback?.comments ?? [];
  const task = courseTasks.find(task => task.id === courseTaskId);
  const studentEndDate = task?.studentEndDate ?? 0;
  const isSubmitDisabled = studentEndDate ? new Date(studentEndDate).getTime() < Date.now() : false;
  return (
    <PageLayout
      loading={false}
      title="Cross-Check Submit"
      githubId={props.session.githubId}
      courseName={props.course.name}
    >
      <Row style={{ margin: 16 }} gutter={24}>
        <Col {...colSizes}>
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item label="Select a task">
              <Select value={courseTaskId!} onChange={handleTaskChange}>
                {courseTasks.map(t => (
                  <Select.Option value={t.id} key={t.id}>
                    {t.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            {isSubmitDisabled && (
              <div>
                <Typography.Text mark type="warning">
                  The deadline has passed already
                </Typography.Text>
              </div>
            )}
            {!isSubmitDisabled && task && (
              <>
                <Form.Item
                  help="NOT link to Github repository or pull request"
                  name="url"
                  label="Solution URL"
                  rules={[{ required: true, pattern: urlPattern, message: 'Please enter a valid url' }]}
                >
                  <Input disabled={isSubmitDisabled} />
                </Form.Item>
                <Button size="large" style={{ marginTop: 16 }} type="primary" htmlType="submit">
                  Submit
                </Button>
              </>
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

import { Button, Form, message } from 'antd';
import { CommentInput, CourseTaskSelect, ScoreInput } from 'components/Forms';
import { PageLayoutSimple } from 'components/PageLayout';
import { StudentSearch } from 'components/StudentSearch';
import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, CourseTask } from 'services/course';
import { CoursePageProps } from 'services/models';

function Page(props: CoursePageProps) {
  const courseId = props.course.id;

  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [courseTaskId, setCourseTaskId] = useState(null as number | null);
  const [courseTasks, setCourseTasks] = useState([] as CourseTask[]);

  useAsync(async () => {
    const data = await courseService.getCourseTasks();
    const courseTasks = data.filter(task => task.checker === 'jury');
    setCourseTasks(courseTasks);
  }, []);

  const fieldsToClear: string[] = ['githubId', 'score', 'comment'];

  const handleSubmit = async (values: any) => {
    if (loading) {
      return;
    }
    try {
      setLoading(true);
      const { githubId, courseTaskId, ...data } = values;
      await courseService.postStudentScore(githubId, courseTaskId, data);
      message.success('Score has been submitted.');
      form.resetFields(fieldsToClear);
    } catch (e) {
      message.error('An error occured. Please try later.');
    } finally {
      setLoading(false);
    }
  };

  const courseTask = courseTasks.find(t => t.id === courseTaskId);
  return (
    <PageLayoutSimple
      loading={loading}
      title="Submit Review By Jury"
      githubId={props.session.githubId}
      courseName={props.course.name}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <CourseTaskSelect data={courseTasks} onChange={setCourseTaskId} />
        <Form.Item name="githubId" label="Student" rules={[{ required: true, message: 'Please select a student' }]}>
          <StudentSearch keyField="githubId" disabled={!courseTaskId} courseId={props.course.id} />
        </Form.Item>
        <ScoreInput courseTask={courseTask} />
        <CommentInput />
        <Button size="large" type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
    </PageLayoutSimple>
  );
}

export default withCourseData(withSession(Page));

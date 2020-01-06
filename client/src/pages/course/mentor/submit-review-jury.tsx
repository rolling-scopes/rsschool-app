import { Button, Form, message } from 'antd';
import { PageLayoutSimple, StudentSearch, withSession } from 'components';
import { CommentInput, CourseTaskSelect, ScoreInput } from 'components/Forms';
import withCourseData from 'components/withCourseData';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, CourseTask } from 'services/course';
import { CoursePageProps } from 'services/models';
import { sortTasksByEndDate } from 'services/rules';

type Props = CoursePageProps;

function Page(props: Props) {
  const courseId = props.course.id;

  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [courseTaskId, setCourseTaskId] = useState(null as number | null);
  const [courseTasks, setCourseTasks] = useState([] as CourseTask[]);

  useAsync(async () => {
    const courseTasks = (await courseService.getCourseTasks())
      .sort(sortTasksByEndDate)
      .filter(task => task.checker === 'jury');

    setCourseTasks(courseTasks);
  });

  const handleTaskChange = async (value: number) => {
    const courseTaskId = Number(value);
    const courseTask = courseTasks.find(t => t.courseTaskId === courseTaskId);
    if (courseTask == null) {
      return;
    }
    setCourseTaskId(courseTaskId);
  };

  const handleSubmit = async (values: any) => {
    if (loading) {
      return;
    }
    try {
      setLoading(true);

      const { githubId, courseTaskId, ...data } = values;
      await courseService.postStudentScore(githubId, courseTaskId, data);

      message.success('Score has been submitted.');
      form.resetFields();
    } catch (e) {
      message.error('An error occured. Please try later.');
    } finally {
      setLoading(false);
    }
  };

  const courseTask = courseTasks.find(t => t.id === courseTaskId);
  const maxScore = courseTask ? courseTask.maxScore || 100 : undefined;
  return (
    <PageLayoutSimple
      loading={loading}
      title="Submit Review By Jury"
      githubId={props.session.githubId}
      courseName={props.course.name}
    >
      <Form onFinish={handleSubmit} layout="vertical">
        <CourseTaskSelect data={courseTasks} onChange={handleTaskChange} />
        <Form.Item name="githubId" label="Student" rules={[{ required: true, message: 'Please select a student' }]}>
          <StudentSearch keyField="githubId" disabled={!courseTaskId} courseId={props.course.id} />
        </Form.Item>
        <ScoreInput maxScore={maxScore} />
        <CommentInput />
        <Button size="large" type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
    </PageLayoutSimple>
  );
}

export default withCourseData(withSession(Page));

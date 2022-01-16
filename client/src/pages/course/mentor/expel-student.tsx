import { Button, Form, Input, message, Typography, Radio } from 'antd';
import { PageLayoutSimple, UserSearch } from 'components';
import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { CoursePageProps, StudentBasic } from 'services/models';

type ActionOnStudent = 'expel' | 'unassign';

function Page(props: CoursePageProps) {
  const courseId = props.course.id;
  const roles = props.session.roles;
  const userGithubId = props.session.githubId;

  const [form] = Form.useForm();
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([] as StudentBasic[]);
  const [action, setAction] = useState<ActionOnStudent>('expel');

  useAsync(async () => {
    if (roles[courseId] === 'student') {
      const student = await courseService.getStudentSummary(userGithubId);
      if (student.isActive) {
        setStudents([
          Object.assign(student, {
            id: props.session.id,
            githubId: props.session.githubId,
            name: props.session.githubId,
          }),
        ]);
      }
    } else {
      const students = await courseService.getMentorStudents();
      const activeStudents = students.filter(student => student.isActive);
      setStudents(activeStudents);
    }
  }, [courseId]);

  const expelStudent = async (githubId: string, comment: string) =>
    githubId === userGithubId
      ? await courseService.selfExpel(githubId, comment)
      : await courseService.expelStudent(githubId, comment);

  const unassignStudent = async (githubId: string, comment: string) => {
    const data = { mentorGithuId: null, unassigningComment: comment };
    await courseService.unassignStudentFromMentor(githubId, data);
  };

  const handleSubmit = async (values: any) => {
    if (!values.githubId || loading) return;
    try {
      setLoading(true);
      switch (action) {
        case 'expel':
          await expelStudent(values.githubId, values.comment);
          break;
        case 'unassign':
          await unassignStudent(values.githubId, values.comment);
          break;
        default:
          throw new Error(`Wrong action on student type: ${action}`);
      }
      const activeStudents = students.filter(s => s.githubId !== values.githubId);
      setStudents(activeStudents);
      form.resetFields();
      message.success(actionMessages[action].success);
    } catch (e) {
      message.error('An error occured. Please try later.');
    } finally {
      setLoading(false);
    }
  };

  const noData = !students.length;

  const actionMessages: {
    [key in ActionOnStudent]: {
      [key: string]: string;
    };
  } = {
    expel: {
      description: 'Selected student will be expelled from this course',
      reasonPhrase: 'Reason for expelling:',
      success: 'The student has been expelled',
    },
    unassign: {
      description: 'Selected student will no longer be your mentee',
      reasonPhrase: 'Reason for unassigning:',
      success: 'The student has been unassigned',
    },
  };

  return (
    <PageLayoutSimple
      loading={loading}
      title="Expel/Unassign Student"
      githubId={props.session.githubId}
      courseName={props.course.name}
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item initialValue={action} name="action" label="Action">
          <Radio.Group onChange={e => setAction(e.target.value)}>
            <Radio value="expel">Expel</Radio>
            <Radio value="unassign">Unassign</Radio>
          </Radio.Group>
        </Form.Item>
        <Typography.Paragraph type="warning">{actionMessages[action].description}</Typography.Paragraph>
        <Form.Item name="githubId" label="Student" rules={[{ required: true, message: 'Please select a student' }]}>
          <UserSearch
            keyField="githubId"
            defaultValues={students}
            disabled={noData}
            placeholder={noData ? 'No Students' : undefined}
          />
        </Form.Item>
        <Form.Item
          name="comment"
          label={actionMessages[action].reasonPhrase}
          rules={[{ required: true, message: 'Please give us a couple words why you are expelling the student' }]}
        >
          <Input.TextArea rows={5} />
        </Form.Item>
        <Button size="large" type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
    </PageLayoutSimple>
  );
}

export default withCourseData(withSession(Page, 'mentor'));

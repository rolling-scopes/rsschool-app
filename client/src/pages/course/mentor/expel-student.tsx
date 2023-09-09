import { Button, Form, Input, message, Radio, Typography } from 'antd';
import { CoursesApi, MentorsApi, MentorStudentDto } from 'api';
import { PageLayoutSimple } from 'components/PageLayout';
import { UserSearch } from 'components/UserSearch';
import { CourseRole } from 'services/models';
import { isMentor, getMentorId } from 'domain/user';
import { useMemo, useState, useContext } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { ActiveCourseProvider, SessionContext, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';

type ActionOnStudent = 'expel' | 'unassign' | 'self-study';

const coursesApi = new CoursesApi();

function Page() {
  const { course } = useActiveCourseContext();
  const session = useContext(SessionContext);
  const courseId = course.id;

  const userGithubId = session.githubId;

  const [form] = Form.useForm();
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Pick<MentorStudentDto, 'id' | 'githubId' | 'name'>[]>([]);
  const [action, setAction] = useState<ActionOnStudent>('expel');

  useAsync(async () => {
    if (isMentor(session, courseId)) {
      const mentorId = getMentorId(session, courseId);
      if (!mentorId) {
        return null;
      }
      const students = await new MentorsApi().getMentorStudents(mentorId);
      const activeStudents = students.data.filter(student => student.active);
      setStudents(activeStudents);
    } else {
      const student = await courseService.getStudentSummary(userGithubId);
      if (student.isActive) {
        setStudents([
          Object.assign(student, {
            id: session.id,
            githubId: session.githubId,
            name: session.githubId,
          }),
        ]);
      }
    }
  }, [courseId]);

  const expelStudent = async (githubId: string, comment: string) =>
    githubId === userGithubId
      ? await coursesApi.leaveCourse(courseId, { comment })
      : await courseService.expelStudent(githubId, comment);

  const unassignStudent = async (githubId: string, comment: string) => {
    const data = { mentorGithuId: null, unassigningComment: comment };
    await courseService.unassignStudentFromMentor(githubId, data);
  };

  const setSelfStudy = async (githubId: string, comment: string) =>
    githubId === userGithubId
      ? await courseService.selfSetSelfStudy(githubId, comment)
      : await courseService.setSelfStudy(githubId, comment);

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
        case 'self-study':
          await setSelfStudy(values.githubId, values.comment);
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
      description:
        'Selected student will no longer be your mentee. They will be put to wait list, so another mentor could take them',
      reasonPhrase: 'Reason for unassigning:',
      success: 'The student has been unassigned',
    },
    'self-study': {
      description: 'Selected student will no longer be your mentee and can continue course without a mentor',
      reasonPhrase: 'Reason for unassigning:',
      success: 'The student has been unassigned',
    },
  };

  return (
    <PageLayoutSimple loading={loading} title="Expel/Unassign Student" showCourseName>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item initialValue={action} name="action" label="Action">
          <Radio.Group onChange={e => setAction(e.target.value)}>
            <Radio value="expel">Expel</Radio>
            <Radio value="unassign">Unassign</Radio>
            <Radio value="self-study">Self-study</Radio>
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

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Mentor, CourseRole.Manager]}>
        <Page />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}

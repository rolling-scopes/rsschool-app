import { Button, Form, message } from 'antd';
import { PageLayoutSimple, UserSearch, withSession, Session } from 'components';
import { CommentInput, CourseTaskSelect, GithubPrInput, ScoreInput } from 'components/Forms';
import withCourseData from 'components/withCourseData';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, CourseTask } from 'services/course';
import { CoursePageProps, StudentBasic } from 'services/models';
import { sortTasksByEndDate } from 'services/rules';

type Props = CoursePageProps;

function Page(props: Props) {
  const { session, course } = props;

  const courseId = course.id;
  const { githubId } = session;

  const courseService = useMemo(() => new CourseService(courseId), [courseId]);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([] as StudentBasic[]);
  const [courseTaskId, setCourseTaskId] = useState(null as number | null);
  const [courseTasks, setCourseTasks] = useState([] as CourseTask[]);

  useAsync(async () => {
    const courseTasks = (await courseService.getCourseTasks())
      .sort(sortTasksByEndDate)
      .filter(
        task =>
          isSumbitedByPowerAdmin(session, courseId)(task) ||
          isSumbitedByTaskOwner(githubId)(task) ||
          isSumbitedByMentor(session, courseId)(task),
      );

    const { students } = await courseService.getAllMentorStudents().catch(() => ({ students: [] }));

    setStudents(students);
    setCourseTasks(courseTasks);
  });

  const loadStudents = async (searchText: string) => {
    const task = courseTasks.find(t => t.id === courseTaskId);
    return isPowerMentor(session, courseId) || isTaskOwner(githubId)(task)
      ? courseService.searchCourseStudent(searchText)
      : students.filter(({ githubId, firstName, lastName }: any) =>
          `${githubId} ${firstName} ${lastName}`.match(searchText),
        );
  };

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
      title="Submit Review"
      courseName={props.course.name}
      githubId={props.session.githubId}
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <CourseTaskSelect data={courseTasks} onChange={handleTaskChange} />
        <Form.Item name="githubId" label="Student" rules={[{ required: true, message: 'Please select a student' }]}>
          <UserSearch defaultValues={students} disabled={!courseTaskId} searchFn={loadStudents} keyField="githubId" />
        </Form.Item>
        <GithubPrInput />
        <ScoreInput maxScore={maxScore} />
        <CommentInput />
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
    </PageLayoutSimple>
  );
}

export default withCourseData(withSession(Page));

const isCheckedByMentor = (task: CourseTask) => task.checker === 'mentor';
const isNotAutoChecked = (task: CourseTask) => task.verification !== 'auto';
const isCheckedByTaskOwner = (task: CourseTask) => task.checker === 'taskOwner';
const hasStudentEndDate = (task: CourseTask) => Boolean(task.studentEndDate);
const isNotUseJury = (task: CourseTask) => !task.useJury;

const isMentor = (session: Session, courseId: number) => {
  const { roles } = session;
  return roles[courseId] === 'mentor';
};

const isPowerMentor = (session: Session, courseId: number) => {
  const { roles, coursesRoles, isAdmin } = session;
  const isCourseManager =
    roles[courseId] === 'coursemanager' || (coursesRoles?.[courseId]?.includes('manager') ?? false);
  return isAdmin || isCourseManager;
};

const isTaskOwner = (githubId: string) => (task?: CourseTask) => {
  return task?.taskOwner?.githubId === githubId;
};

const isSumbitedByTaskOwner = (githubId: string) => (task: CourseTask) =>
  isTaskOwner(githubId)(task) && isCheckedByTaskOwner(task);

const isSumbitedByMentor = (session: Session, courseId: number) => (task: CourseTask) => {
  return (
    hasStudentEndDate(task) &&
    isNotAutoChecked(task) &&
    isNotUseJury(task) &&
    isCheckedByMentor(task) &&
    (isMentor(session, courseId) || isPowerMentor(session, courseId))
  );
};

const isSumbitedByPowerAdmin = (session: Session, courseId: number) => (task: CourseTask) => {
  const { roles, coursesRoles, isAdmin } = session;
  const isCourseManager =
    roles[courseId] === 'coursemanager' || (coursesRoles?.[courseId]?.includes('manager') ?? false);

  const isPowerMentor = isAdmin || isCourseManager;
  return isPowerMentor && (isCheckedByTaskOwner(task) || isSumbitedByMentor(session, courseId)(task));
};

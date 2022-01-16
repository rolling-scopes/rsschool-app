import { Button, Form, message } from 'antd';
import { PageLayoutSimple, Session, UserSearch, withSession } from 'components';
import { CommentInput, CourseTaskSelect, GithubPrInput, ScoreInput } from 'components/Forms';
import withCourseData from 'components/withCourseData';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, CourseTask, AllStudents, AssignedStudent } from 'services/course';
import { CoursePageProps, StudentBasic } from 'services/models';

function Page({ session, course }: CoursePageProps) {
  const courseId = course.id;
  const { githubId, id: userId } = session;

  const courseService = useMemo(() => new CourseService(courseId), [courseId]);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([] as (StudentBasic | AssignedStudent)[]);
  const [allStudents, setAllStudents] = useState(null as AllStudents | null);
  const [courseTaskId, setCourseTaskId] = useState(null as number | null);
  const [courseTasks, setCourseTasks] = useState([] as CourseTask[]);

  useAsync(async () => {
    const [tasks, allStudents] = await Promise.all([
      courseService.getCourseTasks(),
      courseService.getAllMentorStudents().catch(() => ({ students: [], assignedStudents: [] })),
    ]);

    const courseTasks = tasks
      .reverse()
      .filter(
        task =>
          isSubmittedByPowerAdmin(session, courseId)(task) ||
          isSubmittedByTaskOwner(userId)(task) ||
          isSubmittedByMentor(session, courseId)(task),
      );
    setAllStudents(allStudents);
    setCourseTasks(courseTasks);
  }, []);

  const loadStudents = async (searchText: string) => {
    const task = courseTasks.find(t => t.id === courseTaskId);
    return isPowerMentor(session, courseId) || isTaskOwner(userId)(task)
      ? courseService.searchStudents(searchText)
      : students.filter(({ githubId, firstName, lastName }: any) =>
          `${githubId} ${firstName} ${lastName}`.match(searchText),
        );
  };

  const handleTaskChange = (courseTaskId: number) => {
    const courseTask = courseTasks.find(t => t.id === courseTaskId);
    if (courseTask?.checker === 'assigned') {
      const assignedStudents = allStudents?.assignedStudents.filter(s => s.courseTaskId === courseTaskId) ?? [];
      setStudents(assignedStudents);
    } else {
      setStudents(allStudents?.students ?? []);
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
  return (
    <PageLayoutSimple loading={loading} title="Submit Review" courseName={course.name} githubId={githubId}>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <CourseTaskSelect data={courseTasks} onChange={handleTaskChange} />
        <Form.Item name="githubId" label="Student" rules={[{ required: true, message: 'Please select a student' }]}>
          <UserSearch defaultValues={students} disabled={!courseTaskId} searchFn={loadStudents} keyField="githubId" />
        </Form.Item>
        <GithubPrInput />
        <ScoreInput courseTask={courseTask} />
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
const isCheckedByAssigned = (task: CourseTask) => task.checker === 'assigned';
const isNotAutoChecked = (task: CourseTask) => task.verification !== 'auto' && task.checker !== 'auto-test';
const isCheckedByTaskOwner = (task: CourseTask) => task.checker === 'taskOwner';
const hasStudentEndDate = (task: CourseTask) => Boolean(task.studentEndDate);
const isNotUseJury = (task: CourseTask) => !task.useJury;
const isNotInterview = (task: CourseTask) => task.type !== 'interview';

const isMentor = (session: Session, courseId: number) => {
  const { roles } = session;
  return roles[courseId] === 'mentor';
};

const isPowerMentor = (session: Session, courseId: number) => {
  const { roles, coursesRoles, isAdmin } = session;
  const courseRole = coursesRoles?.[courseId];
  const isCourseManager =
    roles[courseId] === 'coursemanager' ||
    (courseRole?.includes('manager') ?? false) ||
    (courseRole?.includes('supervisor') ?? false);
  return isAdmin || isCourseManager;
};

const isTaskOwner = (userId: number) => (task?: CourseTask) => {
  return task?.taskOwnerId === userId;
};

const isSubmittedByTaskOwner = (userId: number) => (task: CourseTask) =>
  isTaskOwner(userId)(task) && isCheckedByTaskOwner(task);

const isSubmittedByMentor = (session: Session, courseId: number) => (task: CourseTask) => {
  return (
    hasStudentEndDate(task) &&
    isNotAutoChecked(task) &&
    isNotUseJury(task) &&
    isNotInterview(task) &&
    (isCheckedByMentor(task) || isCheckedByAssigned(task)) &&
    (isMentor(session, courseId) || isPowerMentor(session, courseId))
  );
};

const isSubmittedByPowerAdmin = (session: Session, courseId: number) => (task: CourseTask) => {
  const { roles, coursesRoles, isAdmin } = session;
  const courseRole = coursesRoles?.[courseId];
  const isCourseManager =
    roles[courseId] === 'coursemanager' ||
    (courseRole?.includes('manager') ?? false) ||
    (courseRole?.includes('supervisor') ?? false);

  const isPowerMentor = isAdmin || isCourseManager;
  return isPowerMentor && (isCheckedByTaskOwner(task) || isSubmittedByMentor(session, courseId)(task));
};

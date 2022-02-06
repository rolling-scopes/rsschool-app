import { Button, Form, message } from 'antd';
import { PageLayoutSimple } from 'components/PageLayout';
import { UserSearch } from 'components/UserSearch';
import { withSession, Session } from 'components/withSession';
import { CommentInput, CourseTaskSelect, GithubPrInput, ScoreInput } from 'components/Forms';
import withCourseData from 'components/withCourseData';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService, AllStudents, AssignedStudent } from 'services/course';
import { CoursePageProps, StudentBasic } from 'services/models';
import { isMentor, isCourseManager, isCourseSupervisor, isPowerUser } from 'domain/user';
import { CoursesTasksApi, CourseTaskDto } from 'api';

const courseTasksApi = new CoursesTasksApi();

function Page({ session, course }: CoursePageProps) {
  const courseId = course.id;
  const { githubId, id: userId } = session;

  const courseService = useMemo(() => new CourseService(courseId), [courseId]);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([] as (StudentBasic | AssignedStudent)[]);
  const [allStudents, setAllStudents] = useState(null as AllStudents | null);
  const [courseTaskId, setCourseTaskId] = useState(null as number | null);
  const [courseTasks, setCourseTasks] = useState([] as CourseTaskDto[]);

  useAsync(async () => {
    const [{ data: tasks }, allStudents] = await Promise.all([
      courseTasksApi.getCourseTasks(courseId),
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
    return isPowerUser(session, courseId) || isTaskOwner(userId)(task)
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

const isCheckedByMentor = (task: CourseTaskDto) => task.checker === 'mentor';
const isCheckedByAssigned = (task: CourseTaskDto) => task.checker === 'assigned';
const isNotAutoChecked = (task: CourseTaskDto) => task.checker !== 'auto-test';
const isCheckedByTaskOwner = (task: CourseTaskDto) => task.checker === 'taskOwner';
const hasStudentEndDate = (task: CourseTaskDto) => Boolean(task.studentEndDate);
const isNotUseJury = (task: CourseTaskDto) => !task.useJury;
const isNotInterview = (task: CourseTaskDto) => task.type !== 'interview';

const isTaskOwner = (userId: number) => (task?: CourseTaskDto) => {
  return task?.taskOwnerId === userId;
};

const isSubmittedByTaskOwner = (userId: number) => (task: CourseTaskDto) =>
  isTaskOwner(userId)(task) && isCheckedByTaskOwner(task);

const isSubmittedByMentor = (session: Session, courseId: number) => (task: CourseTaskDto) => {
  return (
    hasStudentEndDate(task) &&
    isNotAutoChecked(task) &&
    isNotUseJury(task) &&
    isNotInterview(task) &&
    (isCheckedByMentor(task) || isCheckedByAssigned(task)) &&
    (isMentor(session, courseId) || isPowerUser(session, courseId))
  );
};

const isSubmittedByPowerAdmin = (session: Session, courseId: number) => (task: CourseTaskDto) => {
  const { isAdmin } = session;
  const isPowerMentor = isAdmin || isCourseManager(session, courseId) || isCourseSupervisor(session, courseId);
  return isPowerMentor && (isCheckedByTaskOwner(task) || isSubmittedByMentor(session, courseId)(task));
};

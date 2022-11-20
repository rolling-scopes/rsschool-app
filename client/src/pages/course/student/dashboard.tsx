import { Result } from 'antd';
import moment from 'moment';
import Masonry from 'react-masonry-css';
import css from 'styled-jsx/css';
import { useAsync, useLocalStorage } from 'react-use';
import { useMemo, useState } from 'react';
import groupBy from 'lodash/groupBy';
import omitBy from 'lodash/omitBy';
import { LoadingScreen } from 'components/LoadingScreen';
import { PageLayout } from 'components/PageLayout';

import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { CourseService, StudentSummary, CourseEvent } from 'services/course';
import { CoursePageProps } from 'services/models';
import { UserService } from 'services/user';
import {
  MainStatsCard,
  MentorCard,
  TasksStatsCard,
  NextEventCard,
  RepositoryCard,
  TaskStat,
} from 'modules/StudentDashboard/components';
import { useLoading } from 'components/useLoading';
import {
  CoursesTasksApi,
  CourseTaskDto,
  CourseStatsApi,
  CoursesScheduleApi,
  CourseScheduleItemDto,
  CourseScheduleItemDtoStatusEnum,
} from 'api';

const STORAGE_KEY = 'showCountEventsOnStudentsDashboard';

const coursesTasksApi = new CoursesTasksApi();
const coursesStatsApi = new CourseStatsApi();

function Page(props: CoursePageProps) {
  const { githubId } = props.session;
  const { fullName, usePrivateRepositories } = props.course;

  const [storageValue, setStorageValue] = useLocalStorage(STORAGE_KEY);

  const showCountEventsOnStudentsDashboard = () => Number(storageValue ? storageValue : 1);

  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const userService = useMemo(() => new UserService(), [props.course.id]);

  const [studentSummary, setStudentSummary] = useState({} as StudentSummary);
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [courseTasks, setCourseTasks] = useState<CourseTaskDto[]>([]);
  const [nextEvents, setNextEvent] = useState([] as CourseEvent[]);
  const [tasksByStatus, setTasksByStatus] = useState(
    {} as Record<CourseScheduleItemDtoStatusEnum, CourseScheduleItemDto[]>,
  );
  const [countEvents, setCountEvents] = useState(showCountEventsOnStudentsDashboard());
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [loading, withLoading] = useLoading(false);

  const updateUrl = async () => {
    const { repository } = await courseService.getStudentSummary(githubId);
    setRepositoryUrl(repository ? repository : '');
  };

  const changeCountEvents = (value: number) => {
    setStorageValue(String(value));
    setCountEvents(value);
  };

  useAsync(
    withLoading(async () => {
      const courseId = props.course.id;
      const [
        studentSummary,
        { data: courseTasks },
        statisticsCourses,
        courseEvents,
        courseStats,
        { data: scheduleTasks },
      ] = await Promise.all([
        courseService.getStudentSummary(githubId),
        coursesTasksApi.getCourseTasks(courseId),
        userService.getProfileInfo(githubId),
        courseService.getCourseEvents(),
        coursesStatsApi.getCourseStats(courseId),
        new CoursesScheduleApi().getSchedule(courseId),
      ]);

      const startOfToday = moment().startOf('day');
      const nextEvents =
        courseEvents
          .concat(tasksToEvents(courseTasks))
          .sort((a, b) => a.dateTime.localeCompare(b.dateTime))
          .filter(event => moment(event.dateTime).isAfter(startOfToday)) ?? ([] as CourseEvent[]);

      const tasksDetailCurrentCourse =
        statisticsCourses.studentStats?.find(course => course.courseId === props.course.id)?.tasks ?? [];

      setNextEvent(nextEvents);
      setStudentSummary(studentSummary);
      setCourseTasks(courseTasks);
      setRepositoryUrl(studentSummary?.repository ? studentSummary.repository : '');
      setTotalStudentsCount(courseStats?.data.studentsActiveCount || 0);

      setTasksByStatus(
        omitBy(
          groupBy(
            scheduleTasks.map(task => {
              const { comment, taskGithubPrUris } =
                tasksDetailCurrentCourse.find(taskDetail => taskDetail.name === task.name) ?? {};
              return { ...task, comment, githubPrUri: taskGithubPrUris };
            }),
            'status',
          ),
          (_, status) => status === CourseScheduleItemDtoStatusEnum.Archived,
        ) as Record<CourseScheduleItemDtoStatusEnum, TaskStat[]>,
      );
    }),
    [props.course.id],
  );

  const studentPosition = studentSummary?.rank ?? 0;

  const maxCourseScore = Math.round(
    courseTasks.reduce((score, task) => score + (task.maxScore ?? 0) * task.scoreWeight, 0),
  );

  const { isActive = false, totalScore = 0 } = studentSummary ?? {};

  const cards = [
    studentSummary && (
      <MainStatsCard
        isActive={isActive}
        totalScore={totalScore}
        position={studentPosition}
        maxCourseScore={maxCourseScore}
        totalStudentsCount={totalStudentsCount}
      />
    ),
    usePrivateRepositories && (
      <RepositoryCard
        githubId={githubId}
        url={repositoryUrl}
        onSendInviteRepository={courseService.sendInviteRepository.bind(courseService)}
        updateUrl={updateUrl}
      />
    ),
    studentSummary?.mentor && <MentorCard courseId={props.course.id} mentor={studentSummary?.mentor} />,
    courseTasks.length && <TasksStatsCard tasksByStatus={tasksByStatus} courseName={fullName} />,
    <NextEventCard nextEvents={nextEvents} showCountEvents={countEvents} setShowCountEvents={changeCountEvents} />,
  ].filter(Boolean) as JSX.Element[];

  return (
    <PageLayout
      loading={loading}
      title="Student dashboard"
      background="#F0F2F5"
      githubId={props.session.githubId}
      courseName={props.course.name}
    >
      <LoadingScreen show={loading}>
        {studentSummary ? (
          <>
            <Masonry
              breakpointCols={{
                default: 3,
                1180: 2,
                800: 1,
              }}
              className={masonryClassName}
              columnClassName={masonryColumnClassName}
            >
              {cards.map((card, idx) => (
                <div style={{ marginBottom: gapSize }} key={`card-${idx}`}>
                  {card}
                </div>
              ))}
            </Masonry>
            {masonryStyles}
            {masonryColumnStyles}
          </>
        ) : (
          <Result status={'403'} title="You have no access to this page" />
        )}
      </LoadingScreen>
    </PageLayout>
  );
}

const gapSize = 16;
const { className: masonryClassName, styles: masonryStyles } = css.resolve`
  div {
    display: flex;
    margin-left: -${gapSize}px;
    width: auto;
    min-height: 85vh;
  }
`;
const { className: masonryColumnClassName, styles: masonryColumnStyles } = css.resolve`
  div {
    padding-left: ${gapSize}px;
    background-clip: padding-box;
  }
`;

const TaskTypes = {
  deadline: 'deadline',
  test: 'test',
  newtask: 'newtask',
  lecture: 'lecture',
};

const tasksToEvents = (tasks: CourseTaskDto[]) => {
  return tasks.reduce((acc: Array<CourseEvent>, task: CourseTaskDto) => {
    if (task.type !== TaskTypes.test) {
      acc.push(createCourseEventFromTask(task, task.type));
    }
    acc.push(createCourseEventFromTask(task, task.type === TaskTypes.test ? TaskTypes.test : TaskTypes.deadline));
    return acc;
  }, []);
};

const createCourseEventFromTask = (task: CourseTaskDto, type: string): CourseEvent => {
  return {
    id: task.id,
    dateTime: (type === TaskTypes.deadline ? task.studentEndDate : task.studentStartDate) || '',
    event: {
      type: type,
      name: task.name,
      descriptionUrl: task.descriptionUrl,
    },
  } as CourseEvent;
};

export default withCourseData(withSession(Page));

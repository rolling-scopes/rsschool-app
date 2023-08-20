import { Result } from 'antd';
import Masonry from 'react-masonry-css';
import css from 'styled-jsx/css';
import { useAsync } from 'react-use';
import { useMemo, useState } from 'react';
import groupBy from 'lodash/groupBy';
import omitBy from 'lodash/omitBy';
import { LoadingScreen } from 'components/LoadingScreen';
import { PageLayout } from 'components/PageLayout';
import { CourseService, StudentSummary } from 'services/course';
import { CoursePageProps } from 'services/models';
import { UserService } from 'services/user';
import {
  MainStatsCard,
  MentorCard,
  TasksStatsCard,
  NextEventCard,
  RepositoryCard,
  TaskStat,
  AvailableReviewCard,
} from 'modules/StudentDashboard/components';
import { useLoading } from 'components/useLoading';
import {
  CoursesTasksApi,
  CourseTaskDto,
  CourseStatsApi,
  CoursesScheduleApi,
  CourseScheduleItemDto,
  CourseScheduleItemDtoStatusEnum,
  AvailableReviewStatsDto,
  CourseScheduleItemDtoTypeEnum,
} from 'api';
import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { DefaultPageProvider } from 'modules/Course/contexts';

const coursesTasksApi = new CoursesTasksApi();
const coursesStatsApi = new CourseStatsApi();

function Page(props: CoursePageProps) {
  const { githubId } = props.session;
  const { fullName, usePrivateRepositories, alias } = props.course;

  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const userService = useMemo(() => new UserService(), []);

  const [studentSummary, setStudentSummary] = useState({} as StudentSummary);
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [courseTasks, setCourseTasks] = useState<CourseTaskDto[]>([]);
  const [nextEvents, setNextEvent] = useState([] as CourseScheduleItemDto[]);
  const [availableReviews, setAvailableReviews] = useState<AvailableReviewStatsDto[]>([]);
  const [tasksByStatus, setTasksByStatus] = useState(
    {} as Record<CourseScheduleItemDtoStatusEnum, CourseScheduleItemDto[]>,
  );
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [loading, withLoading] = useLoading(false);

  const updateUrl = async () => {
    const { repository } = await courseService.getStudentSummary(githubId);
    setRepositoryUrl(repository ? repository : '');
  };

  useAsync(
    withLoading(async () => {
      const courseId = props.course.id;
      const [
        studentSummary,
        { data: courseTasks },
        statisticsCourses,
        courseStats,
        { data: scheduleItems },
        { data: availableReviews },
      ] = await Promise.all([
        courseService.getStudentSummary(githubId),
        coursesTasksApi.getCourseTasks(courseId),
        userService.getProfileInfo(githubId),
        coursesStatsApi.getCourseStats(courseId),
        new CoursesScheduleApi().getSchedule(courseId),
        coursesTasksApi.getAvailableCrossCheckReviewStats(courseId),
      ]);

      const nextEvents = scheduleItems
        .filter(({ status }) => status === CourseScheduleItemDtoStatusEnum.Available)
        .sort((a, b) => a.startDate.localeCompare(b.startDate));

      const tasksDetailCurrentCourse =
        statisticsCourses.studentStats?.find(course => course.courseId === props.course.id)?.tasks ?? [];

      setNextEvent(nextEvents);
      setStudentSummary(studentSummary);
      setCourseTasks(courseTasks);
      setRepositoryUrl(studentSummary?.repository ? studentSummary.repository : '');
      setTotalStudentsCount(courseStats?.data.studentsActiveCount || 0);
      setAvailableReviews(availableReviews ?? []);

      setTasksByStatus(
        omitBy(
          groupBy(
            scheduleItems
              .filter(scheduleItem => scheduleItem.type === CourseScheduleItemDtoTypeEnum.CourseTask)
              .map(task => {
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
    courseTasks.length && <TasksStatsCard tasksByStatus={tasksByStatus} courseName={fullName} />,
    <NextEventCard key="next-event-card" nextEvents={nextEvents} courseAlias={alias} />,
    <AvailableReviewCard key="available-review-card" availableReviews={availableReviews} courseAlias={alias} />,
    <MentorCard key="mentor-card" courseId={props.course.id} mentor={studentSummary?.mentor} />,
    usePrivateRepositories && (
      <RepositoryCard
        githubId={githubId}
        url={repositoryUrl}
        onSendInviteRepository={courseService.sendInviteRepository.bind(courseService)}
        updateUrl={updateUrl}
      />
    ),
  ].filter(Boolean) as JSX.Element[];

  return (
    <PageLayout loading={loading} title="Student dashboard" background="#F0F2F5" showCourseName={true}>
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

const gapSize = 24;
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

function PageWithSession(props: CoursePageProps) {
  return (
    <DefaultPageProvider course={props.course}>
      <Page {...props} />
    </DefaultPageProvider>
  );
}

export default withCourseData(withSession(PageWithSession));

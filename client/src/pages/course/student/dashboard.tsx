import { PageLayout } from 'components/PageLayout';
import { useContext, useMemo } from 'react';
import Masonry from 'react-masonry-css';

import { SessionContext, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';
import styles from './dashboard.module.css';
import {
  AvailableReviewCard,
  MainStatsCard,
  MentorCard,
  NextEventCard,
  RepositoryCard,
  TasksStatsCard,
  useDashboardData,
} from 'modules/StudentDashboard';
import { CourseService } from 'services/course';

const gapSize = 24;

function Page() {
  const { githubId } = useContext(SessionContext);
  const { course } = useActiveCourseContext();

  const { fullName, usePrivateRepositories, alias } = course;

  const courseService = useMemo(() => new CourseService(course.id), [course.id]);

  const { data, loading, run } = useDashboardData(course.id, githubId);

  const studentPosition = data?.studentSummary?.rank ?? 0;
  const maxCourseScore = data?.maxCourseScore ?? 0;

  const { isActive = false, totalScore = 0 } = data?.studentSummary ?? {};

  const cards = [
    data?.studentSummary && (
      <MainStatsCard
        isActive={isActive}
        totalScore={totalScore}
        position={studentPosition}
        maxCourseScore={maxCourseScore}
        totalStudentsCount={data?.courseStats?.activeStudentsCount ?? 0}
      />
    ),
    data?.tasksByStatus && <TasksStatsCard tasksByStatus={data?.tasksByStatus} courseName={fullName} />,
    <NextEventCard key="next-event-card" nextEvents={data?.nextEvents ?? []} courseAlias={alias} />,
    <AvailableReviewCard
      key="available-review-card"
      availableReviews={data?.availableReviews ?? []}
      courseAlias={alias}
    />,
    <MentorCard key="mentor-card" courseId={course.id} mentor={data?.studentSummary?.mentor} />,
    usePrivateRepositories && (
      <RepositoryCard
        githubId={githubId}
        url={data?.studentSummary.repository ?? ''}
        onSendInviteRepository={courseService.sendInviteRepository.bind(courseService)}
        onUpdateUrl={() => run()}
      />
    ),
  ].filter(Boolean) as JSX.Element[];

  return (
    <PageLayout loading={loading} title="Student dashboard" showCourseName>
      <>
        <Masonry
          breakpointCols={{ default: 3, 1180: 2, 800: 1 }}
          className={styles.masonry as string}
          columnClassName={styles.masonryColumn as string}
        >
          {cards.map((card, idx) => (
            <div style={{ marginBottom: gapSize }} key={`card-${idx}`}>
              {card}
            </div>
          ))}
        </Masonry>
      </>
    </PageLayout>
  );
}

export default function () {
  return (
    <SessionProvider allowedRoles={['student']}>
      <Page />
    </SessionProvider>
  );
}

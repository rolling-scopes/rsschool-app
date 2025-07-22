import { PageLayout } from 'components/PageLayout';
import { Instructions, Notification, TaskSolutionsTable } from '..';
import { SessionContext, useActiveCourseContext } from 'modules/Course/contexts';
import { useContext } from 'react';
import { useMentorDashboard } from 'modules/Mentor/hooks/useMentorDashboard';

function MentorDashboard() {
  const { courses } = useContext(SessionContext);
  const { course } = useActiveCourseContext();
  const { id: courseId, discordServerId } = course;
  const mentorId = courses?.[courseId]?.mentorId as number;

  const [data, loading, run] = useMentorDashboard(mentorId, courseId);

  return (
    <PageLayout loading={loading} title="Mentor's Dashboard" showCourseName>
      <Notification />
      {data?.length ? (
        <TaskSolutionsTable data={data} loading={loading} onChange={run} mentorId={mentorId} courseId={courseId} />
      ) : (
        <Instructions courseId={courseId} discordServerId={discordServerId} />
      )}
    </PageLayout>
  );
}

export default MentorDashboard;

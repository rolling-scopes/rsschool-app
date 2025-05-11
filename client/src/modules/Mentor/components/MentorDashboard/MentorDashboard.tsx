import { PageLayout } from 'components/PageLayout';
import { Instructions, Notification, TaskSolutionsTable } from '..';
import { SessionContext, useActiveCourseContext } from 'modules/Course/contexts';
import { useContext } from 'react';
import { useMentorDashboard } from 'modules/Mentor/hooks/useMentorDashboard';

function MentorDashboard() {
  const { courses } = useContext(SessionContext);
  const { course } = useActiveCourseContext();
  const { id: courseId } = course;
  const mentorId = courses?.[courseId]?.mentorId as number;

  const [data, loading, run] = useMentorDashboard(mentorId, courseId);

  return (
    <PageLayout loading={loading} title="Mentor's Dashboard" background="#F0F2F5" showCourseName>
      <Notification />
      {data?.length ? (
        <TaskSolutionsTable data={data} loading={loading} onChange={run} mentorId={mentorId} courseId={courseId} />
      ) : (
        <Instructions />
      )}
    </PageLayout>
  );
}

export default MentorDashboard;

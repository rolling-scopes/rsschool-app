import React from 'react';
import { PageLayout } from 'components/PageLayout';
import { CoursePageProps } from 'services/models';
import { Instructions, Notification, TaskSolutionsTable } from '..';
import { getMentorId } from 'domain/user';
import { useMentorDashboard } from 'modules/Mentor/hooks/useMentorDashboard';

function MentorDashboard({ session, course }: CoursePageProps) {
  const { id: courseId } = course;
  const mentorId = getMentorId(session, courseId);

  const [data, loading] = useMentorDashboard(mentorId, courseId);

  return (
    <PageLayout
      loading={loading}
      title="Mentor's dashboard"
      background="#F0F2F5"
      githubId={session.githubId}
      courseName={course.name}
    >
      <Notification />
      {data && data?.length > 0 ? <TaskSolutionsTable data={data} course={course} /> : <Instructions />}
    </PageLayout>
  );
}

export default MentorDashboard;

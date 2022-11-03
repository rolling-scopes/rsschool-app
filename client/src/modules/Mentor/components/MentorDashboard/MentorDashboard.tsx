import React from 'react';
import { PageLayout } from 'components/PageLayout';
import { CoursePageProps } from 'services/models';
import { Instructions, Notification, TaskSolutionsTable } from '..';
import { getMentorId } from 'domain/user';
import { useMentorStudentsCount } from 'modules/Mentor/hooks/useMentorStudentsCount';

function MentorDashboard({ session, course }: CoursePageProps) {
  const { id: courseId } = course;
  const mentorId = getMentorId(session, courseId);

  const [studentsCount, loading] = useMentorStudentsCount(mentorId, courseId);

  return (
    <PageLayout
      loading={loading}
      title="Mentor's dashboard"
      background="#F0F2F5"
      githubId={session.githubId}
      courseName={course.name}
    >
      <Notification />
      {studentsCount ? <TaskSolutionsTable mentorId={mentorId} courseId={courseId} /> : <Instructions />}
    </PageLayout>
  );
}

export default MentorDashboard;

import React from 'react';
import { PageLayout } from 'components/PageLayout';
import { Instructions, Notification, TaskSolutionsTable } from '..';
import { MentorDashboardProps } from 'modules/Course/data';

function MentorDashboard({ session, course, mentorId, studentsCount }: MentorDashboardProps) {
  const { id: courseId } = course;

  return (
    <PageLayout
      loading={false}
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

import React, { useState } from 'react';
import { PageLayout } from 'components/PageLayout';
import { CoursePageProps } from 'services/models';
import { Instructions, Notification, StudentsTable } from '..';

// TODO: add useLoading & <Loading />
function MentorDashboard({ session, course }: CoursePageProps) {
  const [hasStudents] = useState(true);

  return (
    <PageLayout
      loading={false}
      title="Mentor's dashboard"
      background="#F0F2F5"
      githubId={session.githubId}
      courseName={course.name}
    >
      <Notification />
      {hasStudents ? <StudentsTable /> : <Instructions />}
    </PageLayout>
  );
}

export default MentorDashboard;

import React, { useMemo, useState } from 'react';
import { PageLayout } from 'components/PageLayout';
import { CoursePageProps } from 'services/models';
import { Instructions, Notification, StudentsTable } from '..';
import { getMentorId } from 'domain/user';
import { useMentorDashboard } from 'modules/Mentor/hooks/useMentorDashboard';

// TODO: add useLoading & <Loading />
function MentorDashboard({ session, course }: CoursePageProps) {
  const { id: courseId } = course;
  const mentorId = getMentorId(session, courseId);

  const [data, loading] = useMentorDashboard(mentorId, courseId);
  const hasStudents = useMemo(() => data?.length !== 0, [data]);

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

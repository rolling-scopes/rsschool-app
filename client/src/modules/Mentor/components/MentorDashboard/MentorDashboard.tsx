import React from 'react';
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

  return (
    <PageLayout
      loading={loading}
      title="Mentor's dashboard"
      background="#F0F2F5"
      githubId={session.githubId}
      courseName={course.name}
    >
      <Notification />
      {data && data?.length !== 0 ? <StudentsTable data={data} /> : <Instructions />}
      {/* TODO: remove when data will be ready */}
      {/*
      <StudentsTable
        data={[
          {
            githubPrUrl: 'githubPrUrl',
            maxScore: 100,
            resultScore: 20,
            studentGithubId: 'github',
            studentName: 'Name',
            taskDescriptionUrl: 'githubPrUrl',
            taskId: 12,
            taskName: 'Task Name',
          },
        ]}
      /> */}
    </PageLayout>
  );
}

export default MentorDashboard;

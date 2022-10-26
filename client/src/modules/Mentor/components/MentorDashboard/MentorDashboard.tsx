import React from 'react';
import { PageLayout } from 'components/PageLayout';
import { CoursePageProps } from 'services/models';
import { Notification } from 'modules/Mentor/components/Notification';

// TODO: add useLoading & <Loading />
function MentorDashboard(props: CoursePageProps) {
  return (
    <PageLayout
      loading={false}
      title="Mentor's dashboard"
      background="#F0F2F5"
      githubId={props.session.githubId}
      courseName={props.course.name}
    >
      <Notification />
    </PageLayout>
  );
}

export default MentorDashboard;

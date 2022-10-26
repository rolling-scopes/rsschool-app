import React from 'react';
import { PageLayout } from 'components/PageLayout';
import { CoursePageProps } from 'services/models';

function MentorDashboard(props: CoursePageProps) {
  return (
    <PageLayout
      loading={false}
      title="Mentor's dashboard"
      background="#F0F2F5"
      githubId={props.session.githubId}
      courseName={props.course.name}
    ></PageLayout>
  );
}

export default MentorDashboard;

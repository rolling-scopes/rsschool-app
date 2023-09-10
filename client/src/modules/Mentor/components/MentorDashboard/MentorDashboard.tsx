import { PageLayout } from 'components/PageLayout';
import { Instructions, Notification, TaskSolutionsTable } from '..';
import { MentorDashboardProps } from 'pages/course/mentor/dashboard';

function MentorDashboard({ course, mentorId, studentsCount }: MentorDashboardProps) {
  const { id: courseId } = course;

  return (
    <PageLayout loading={false} title="Mentor's dashboard" background="#F0F2F5" showCourseName>
      <Notification />
      {studentsCount ? <TaskSolutionsTable mentorId={mentorId} courseId={courseId} /> : <Instructions />}
    </PageLayout>
  );
}

export default MentorDashboard;

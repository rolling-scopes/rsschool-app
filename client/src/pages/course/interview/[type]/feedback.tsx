import { SessionProvider } from 'modules/Course/contexts';
import { Feedback } from 'modules/Interviews/pages/feedback/Feeback';
import { InterviewFeedback } from 'modules/Interviews/pages/InterviewFeedback';
import { getServerSideProps, PageProps } from 'modules/Interviews/pages/InterviewFeedback/getServerSideProps';
import { featureToggles } from 'services/features';
import { CourseRole } from 'services/models';

export { getServerSideProps };

export default function (props: PageProps) {
  return (
    <SessionProvider allowedRoles={[CourseRole.Mentor]} course={props.course}>
      {featureToggles.feedback ? <Feedback {...props} />:<InterviewFeedback {...props} />}
      
    </SessionProvider>
  );
}

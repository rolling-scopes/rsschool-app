import withSession from 'components/withSession';
import { SessionProvider } from 'modules/Course/contexts';
import { InterviewWaitingList, PageProps } from 'modules/Mentor/pages/InterviewWaitingList';
import { getServerSideProps } from 'modules/Mentor/pages/InterviewWaitingList/getServerSideProps';
import { CourseRole } from 'services/models';

export { getServerSideProps };

function Page(props: PageProps) {
  return (
    <SessionProvider allowedRoles={[CourseRole.Mentor]}>
      <InterviewWaitingList {...props} />
    </SessionProvider>
  );
}

export default withSession(Page);

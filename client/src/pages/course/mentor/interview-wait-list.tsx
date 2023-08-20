import withSession from 'components/withSession';
import { DefaultPageProvider } from 'modules/Course/contexts';
import { InterviewWaitingList, PageProps } from 'modules/Mentor/pages/InterviewWaitingList';
import { getServerSideProps } from 'modules/Mentor/pages/InterviewWaitingList/getServerSideProps';
import { CourseRole } from 'services/models';

export { getServerSideProps };

function Page(props: PageProps) {
  return (
    <DefaultPageProvider allowedRoles={[CourseRole.Mentor]}>
      <InterviewWaitingList {...props} />
    </DefaultPageProvider>
  );
}

export default withSession(Page);

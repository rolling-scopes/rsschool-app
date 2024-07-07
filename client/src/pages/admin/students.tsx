import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';
import { Students } from 'modules/Students/Pages/Students';
import { getServerSideProps, PageProps } from 'modules/Students/Pages/getServerSideProps';

export { getServerSideProps };

export default function (props: PageProps) {
  return (
    <ActiveCourseProvider>
      <SessionProvider hirerOnly>
        <Students {...props} />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}

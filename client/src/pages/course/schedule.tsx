import { SessionProvider } from 'modules/Course/contexts';
import { getCourseProps as getServerSideProps, PageProps } from 'modules/Course/data/getCourseProps';
import { SchedulePage } from 'modules/Schedule/pages/SchedulePage';

export { getServerSideProps };

export default function (props: PageProps) {
  return (
    <SessionProvider course={props.course}>
      <SchedulePage {...props} />
    </SessionProvider>
  );
}

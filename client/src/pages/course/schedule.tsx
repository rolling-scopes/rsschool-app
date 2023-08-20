import { SessionAndCourseProvider } from 'modules/Course/contexts';
import { getCourseProps as getServerSideProps, PageProps } from 'modules/Course/data/getCourseProps';
import { SchedulePage } from 'modules/Schedule/pages/SchedulePage';

export { getServerSideProps };

function Page(props: PageProps) {
  return (
    <SessionAndCourseProvider course={props.course}>
      <SchedulePage {...props} />
    </SessionAndCourseProvider>
  );
}

export default function (props: PageProps) {
  return <Page {...props} />;
}

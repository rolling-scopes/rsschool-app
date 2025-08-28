import { CourseStatistics } from 'modules/CourseStatistics';
import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';

function Page() {
  return (
    <ActiveCourseProvider>
      <SessionProvider adminOnly>
        <CourseStatistics />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}

export default Page;

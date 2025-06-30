import { CourseStatistics } from 'modules/CourseStatistics';
import { SessionProvider } from 'modules/Course/contexts';

function Page() {
  return (
    <SessionProvider>
      <CourseStatistics />
    </SessionProvider>
  );
}

export default Page;

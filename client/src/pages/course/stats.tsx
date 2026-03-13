import { CourseStatistics } from '@client/modules/CourseStatistics';
import { SessionProvider } from '@client/modules/Course/contexts';

function Page() {
  return (
    <SessionProvider>
      <CourseStatistics />
    </SessionProvider>
  );
}

export default Page;

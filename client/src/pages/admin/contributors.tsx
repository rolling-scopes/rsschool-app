import { ContributorPage } from 'modules/Contributor/pages/ContributorPage';
import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider adminOnly>
        <ContributorPage />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}

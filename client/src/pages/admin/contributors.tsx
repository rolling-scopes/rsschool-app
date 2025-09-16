import { ContributorPage } from 'modules/Contributor/pages/ContributorPage';
import { SessionProvider } from 'modules/Course/contexts';

export default function () {
  return (
    <SessionProvider adminOnly>
      <ContributorPage />
    </SessionProvider>
  );
}

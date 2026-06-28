import { ContributorPage } from '@client/modules/Contributor/pages/ContributorPage';
import { SessionProvider } from '@client/modules/Course/contexts';

export default function () {
  return (
    <SessionProvider adminOnly>
      <ContributorPage />
    </SessionProvider>
  );
}

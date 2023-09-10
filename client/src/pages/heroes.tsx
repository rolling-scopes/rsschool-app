import { PageLayout } from 'components/PageLayout';
import { HeroesForm } from '../components/Forms/Heroes';
import { useState } from 'react';
import { ActiveCourseProvider, SessionProvider } from 'modules/Course/contexts';

function Page() {
  const [loading, setLoading] = useState(false);
  return (
    <SessionProvider>
      <ActiveCourseProvider>
        <PageLayout loading={loading} title="Heroes">
          <HeroesForm setLoading={setLoading} />
        </PageLayout>
      </ActiveCourseProvider>
    </SessionProvider>
  );
}

export default Page;

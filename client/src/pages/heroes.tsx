import { PageLayout } from 'components/PageLayout';
import withSession from 'components/withSession';
import { HeroesForm } from '../components/Forms/Heroes';
import React, { useState } from 'react';
import { SessionProvider } from 'modules/Course/contexts';
import { ActiveCourseProvider } from 'modules/Course/contexts/ActiveCourseContext';

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

export default withSession(Page);

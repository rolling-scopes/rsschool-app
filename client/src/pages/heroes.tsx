import { PageLayout } from 'components/PageLayout';
import withSession from 'components/withSession';
import { HeroesForm } from '../components/Forms/Heroes';
import React, { useState } from 'react';
import { SessionAndCourseProvider } from 'modules/Course/contexts';

function Page() {
  const [loading, setLoading] = useState(false);
  return (
    <SessionAndCourseProvider>
      <PageLayout loading={loading} title="Heroes">
        <HeroesForm setLoading={setLoading} />
      </PageLayout>
    </SessionAndCourseProvider>
  );
}

export default withSession(Page);

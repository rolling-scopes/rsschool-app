import { PageLayout } from 'components';
import withSession, { Session } from 'components/withSession';
import { HeroesForm } from '../components/Forms/Heroes';
import React, { useState } from 'react';

type Props = {
  session: Session;
};

function Page(props: Props) {
  const [loading, setLoading] = useState(false);
  return (
    <PageLayout loading={loading} title="Heroes" githubId={props.session.githubId}>
      <HeroesForm setLoading={setLoading} />
    </PageLayout>
  );
}

export default withSession(Page);

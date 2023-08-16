import { PageLayout } from 'components/PageLayout';
import withSession, { Session } from 'components/withSession';
import { useState } from 'react';

type Props = {
  session: Session;
};

function Page(props: Props) {
  const [loading, setLoading] = useState(false);

  return (
    <PageLayout loading={loading} title="Heroes Radar" githubId={props.session.githubId}>

    </PageLayout>
  );
}

export default withSession(Page);

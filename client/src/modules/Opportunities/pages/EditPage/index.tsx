import React, { useState, PropsWithChildren } from 'react';
import { Layout } from 'antd';
import Head from 'next/head';
import { LoadingScreen } from 'components/LoadingScreen';
import { Session } from 'components/withSession';
import { Header } from 'components/Header';
import { EditViewResume } from 'modules/Opportunities/components/EditViewResume';

import { OpportunitiesService } from '../../services/opportunities';
import { useAsync } from 'react-use';
import { useLoading } from 'components/useLoading';

const { Content } = Layout;
const service = new OpportunitiesService();

type Props = { session: Session };

export function EditPage({ session }: PropsWithChildren<Props>) {
  const githubId = session.githubId;

  const [loading, withLoading] = useLoading(false);
  const [editMode, setEditMode] = useState(false);
  const [consent, setConsent] = useState(false);
  const [notFound] = useState(false);

  const switchView = async (checked: boolean) => setEditMode(!checked);

  const giveConsent = withLoading(async (githubId: string) => setConsent(await service.updateConsent(githubId, true)));
  const withdrawConsent = withLoading(async (githubId: string) =>
    setConsent(await service.updateConsent(githubId, false)),
  );
  const getConsent = withLoading(async () => setConsent(await service.getConsent(githubId)));

  useAsync(getConsent, [githubId]);

  const { isAdmin, isHirer } = session;

  const isOwner = session.githubId === githubId;
  const hasPriorityRole = isAdmin || isHirer;

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;700&display=swap" rel="stylesheet" />
      </Head>
      <LoadingScreen show={loading || !githubId}>
        <Header username={session.githubId} />
        <Layout className="cv-layout">
          <Content className="print-no-padding" style={{ maxWidth: 960, backgroundColor: '#FFF', margin: 'auto' }}>

            <EditViewResume
              hasPriorityRole={hasPriorityRole}
              ownerGithubId={githubId}
              isOwner={isOwner}
              notFound={notFound}
              consent={consent}
              editMode={editMode}
              switchView={switchView}
              withdrawConsent={withdrawConsent}
              giveConsent={giveConsent}
            />
          </Content>
        </Layout>
      </LoadingScreen>
      <style jsx global>{`
        html,
        body {
          font-family: 'Ubuntu', sans-serif;
        }
        .cv-layout {
          background-color: white !important;
        }
      `}</style>
    </>
  );
}

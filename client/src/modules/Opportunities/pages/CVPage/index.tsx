import React, { useState, PropsWithChildren } from 'react';
import { Layout } from 'antd';
import Head from 'next/head';
import { LoadingScreen } from 'components/LoadingScreen';
import { useRouter } from 'next/router';
import { Session } from 'components/withSession';
import { Header } from 'components';
import CVInfo from 'modules/Opportunities/components/CVPage';

import { OpportunitiesService } from '../../services/opportunities';
import { useAsync } from 'react-use';
import { useLoading } from 'components/useLoading';

const { Content } = Layout;
const service = new OpportunitiesService();

type Props = { session: Session };

export function CVPage({ session }: PropsWithChildren<Props>) {
  const router = useRouter();

  const githubId = (router?.query?.githubId as string)?.toLowerCase();

  const [loading, withLoading] = useLoading(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [consent, setConsent] = useState<boolean>(false);
  const [notFound] = useState<boolean>(false);

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
          <Content style={{ maxWidth: 960, backgroundColor: '#FFF', margin: 'auto' }}>
            <CVInfo
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
        @media print {
          .ant-avatar-icon,
          .profile,
          .footer {
            display: none !important;
          }
          .black-on-print {
            color: black !important;
          }
          .cv-layout,
          .ant-layout-content {
            margin: 0 !important;
          }
        }
        @media (max-width: 959px) {
          .view-cv-layout {
            width: 100% !important;
          }
        }
        .cv-layout {
          background-color: white !important;
        }
      `}</style>
    </>
  );
}

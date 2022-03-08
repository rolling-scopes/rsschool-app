import React, { useState, useContext } from 'react';
import { Layout } from 'antd';
import Head from 'next/head';
import { LoadingScreen } from 'components/LoadingScreen';
import { Header } from 'components/Header';
import { EditViewResume } from 'modules/Opportunities/components/EditViewResume';

import { OpportunitiesService } from '../../services/opportunities';
import { useAsync } from 'react-use';
import { useLoading } from 'components/useLoading';
import { SessionContext } from 'modules/Course/contexts';
import { useResumeData } from 'modules/Opportunities/hooks/useResumeData';

const { Content } = Layout;
const service = new OpportunitiesService();

export function EditPage() {
  const session = useContext(SessionContext);
  const githubId = session.githubId;

  const [loading, withLoading] = useLoading(false);
  const [editMode, setEditMode] = useState(false);
  const [consent, setConsent] = useState(false);

  const switchView = async (checked: boolean) => setEditMode(!checked);

  const handleCreateConsent = withLoading(async () => setConsent(await service.updateConsent(githubId, true)));
  const handleRemoveConsent = withLoading(async () => setConsent(await service.updateConsent(githubId, false)));

  const getConsent = withLoading(async () => setConsent(await service.getConsent(githubId)));
  const [resumeData, error, resumeLoading] = useResumeData({ githubId });

  useAsync(getConsent, [githubId]);

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;700&display=swap" rel="stylesheet" />
      </Head>
      <LoadingScreen show={loading || resumeLoading}>
        <Header username={session.githubId} />
        <Layout className="cv-layout">
          <Content className="print-no-padding" style={{ maxWidth: 960, backgroundColor: '#FFF', margin: 'auto' }}>
            <EditViewResume
              githubId={githubId}
              consent={consent}
              data={resumeData ?? null}
              error={error}
              editMode={editMode || resumeData === null}
              switchView={switchView}
              onRemoveConsent={handleRemoveConsent}
              onCreateConsent={handleCreateConsent}
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

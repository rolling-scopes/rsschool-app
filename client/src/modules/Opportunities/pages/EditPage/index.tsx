import { Layout } from 'antd';
import { OpportunitiesApi, ResumeDto } from 'api';
import { AxiosError } from 'axios';
import { Header } from 'components/Header';
import { LoadingScreen } from 'components/LoadingScreen';
import { useLoading } from 'components/useLoading';
import { SessionContext } from 'modules/Course/contexts';
import { EditViewResume } from 'modules/Opportunities/components/EditViewResume';
import Head from 'next/head';
import React, { useContext, useEffect, useState } from 'react';

const { Content } = Layout;
const service = new OpportunitiesApi();

export function EditPage() {
  const { githubId } = useContext(SessionContext);
  const [loading, withLoading] = useLoading(false);
  const [editMode, setEditMode] = useState(false);
  const [consent, setConsent] = useState(false);
  const [resume, setResume] = useState<ResumeDto | null>(null);

  const switchView = async (checked: boolean) => setEditMode(!checked);

  useEffect(() => {
    getData();
  }, [editMode]);

  const getData = async () => {
    const { data } = await service.getConsent();
    if (data.consent) {
      try {
        const { data } = await service.getResume(githubId);
        setResume(data);
      } catch (err) {
        const error = err as AxiosError;
        if (error.response?.status === 404) {
          setResume(null);
          return;
        }
        throw err;
      }
    }
    setConsent(data.consent);
  };

  const handleConsentUpdate = withLoading(async (value: boolean) => {
    value ? await service.createConsent() : await service.deleteConsent();
    await getData();
  });

  // const loadData = withLoading(getData);

  // useEffect(() => {
  //   loadData();
  // }, [githubId]);

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;700&display=swap" rel="stylesheet" />
      </Head>
      <LoadingScreen show={loading}>
        <Header username={githubId} />
        <Layout className="cv-layout">
          <Content className="print-no-padding" style={{ maxWidth: 960, backgroundColor: '#FFF', margin: 'auto' }}>
            <EditViewResume
              githubId={githubId}
              consent={consent}
              data={resume}
              editMode={editMode || resume == null}
              switchView={switchView}
              onRemoveConsent={() => handleConsentUpdate(false)}
              onCreateConsent={() => handleConsentUpdate(true)}
              onUpdateResume={() => getData()}
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

import React, { useContext, useEffect, useState } from 'react';
import { Layout, Typography, Modal } from 'antd';
import { AxiosError } from 'axios';
import moment from 'moment';
import Head from 'next/head';
import { OpportunitiesApi, ResumeDto } from 'api';
import { OpportunitiesService } from 'modules/Opportunities/services/opportunities';
import { Header } from 'components/Header';
import { LoadingScreen } from 'components/LoadingScreen';
import { useLoading } from 'components/useLoading';
import { SessionContext } from 'modules/Course/contexts';
import { EditViewResume } from 'modules/Opportunities/components/EditViewResume';

const { Content } = Layout;
const { Text, Paragraph } = Typography;

const service = new OpportunitiesApi();
const oldService = new OpportunitiesService();

export function EditPage() {
  const { githubId } = useContext(SessionContext);
  const [loading, withLoading] = useLoading(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [consent, setConsent] = useState<boolean>(false);
  const [resume, setResume] = useState<ResumeDto | null>(null);

  const switchView = () => setEditMode(!editMode);

  useEffect(() => {
    getData();
  }, [editMode]);

  const getData = withLoading(async () => {
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
  });

  const handleConsentUpdate = withLoading(async (value: boolean) => {
    value ? await service.createConsent() : await service.deleteConsent();
    await getData();
  });

  const showCreationModal = (validUntilTimestamp: number) => {
    const validUntil = moment(validUntilTimestamp).format('YY-MM-DD');

    const title = <Text strong>Your CV is now public until {validUntil} (for 1 month period from now on)</Text>;
    const content = (
      <>
        <Paragraph>You need to renew or make changes in your CV every month.</Paragraph>
        <Paragraph>
          {' '}
          Otherwise it will not be shown to other RS App users.{' '}
          <a href="https://docs.app.rs.school/#/platform/cv" target="_blank" rel="noreferrer">
            Learn more about CV
          </a>
        </Paragraph>
      </>
    );

    Modal.info({
      title,
      content,
      okText: 'Got it',
    });
  };

  const handleCreateConsent = async () => {
    await handleConsentUpdate(true);
    const updatedTimestamp = await oldService.updateResume();
    showCreationModal(updatedTimestamp);
    setEditMode(true);
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;700&display=swap" rel="stylesheet" />
      </Head>
      <LoadingScreen show={loading}>
        <Header username={githubId} title="My CV" />
        <Layout className="cv-layout">
          <Content className="print-no-padding" style={{ maxWidth: 960, backgroundColor: '#FFF', margin: 'auto' }}>
            <EditViewResume
              githubId={githubId}
              consent={consent}
              data={resume}
              editMode={editMode || resume == null}
              switchView={switchView}
              onRemoveConsent={() => handleConsentUpdate(false)}
              onCreateConsent={handleCreateConsent}
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

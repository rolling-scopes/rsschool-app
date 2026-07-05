import { useContext, useState } from 'react';
import { Layout, message, Modal, Typography } from 'antd';
import { useRequest } from 'ahooks';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import Head from 'next/head';
import { OpportunitiesApi, ResumeDto } from '@client/api';
import { Header } from '@client/shared/components/Header';
import { LoadingScreen } from '@client/shared/components/LoadingScreen';
import { SessionContext } from '@client/modules/Course/contexts';
import { EditViewCv } from '@client/modules/Opportunities/components/EditViewCv';

const { Content } = Layout;
const { Text, Paragraph } = Typography;

const service = new OpportunitiesApi();

export function EditPage() {
  const { githubId } = useContext(SessionContext);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [consent, setConsent] = useState<boolean>(false);
  const [resume, setResume] = useState<ResumeDto | null>(null);
  const [modal, contextHolder] = Modal.useModal();

  const switchView = () => setEditMode(!editMode);

  const loadDataRequest = useRequest(
    async () => {
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
    },
    {
      refreshDeps: [editMode],
      onError: () => {
        message.error('An unexpected error occurred. Please try later.');
      },
    },
  );

  const deleteConsentRequest = useRequest(
    async () => {
      const { data } = await service.deleteConsent();
      await loadDataRequest.runAsync();
      return data;
    },
    {
      manual: true,
      onError: () => {
        message.error('An unexpected error occurred. Please try later.');
      },
    },
  );

  const showCreationModal = (validUntilTimestamp: number) => {
    const validUntil = dayjs(validUntilTimestamp).format('YY-MM-DD');

    const title = <Text strong>Your CV is now public until {validUntil} (for 1 month period from now on)</Text>;
    const content = (
      <>
        <Paragraph>You need to renew your CV every month.</Paragraph>
        <Paragraph>
          {' '}
          Otherwise it will not be shown to other RS App users.{' '}
          <a href="https://docs.app.rs.school/#/platform/cv" target="_blank" rel="noreferrer">
            Learn more about CV
          </a>
        </Paragraph>
      </>
    );

    modal.info({
      title,
      content,
      okText: 'Got it',
    });
  };

  const createConsentRequest = useRequest(
    async () => {
      const { data } = await service.createConsent();
      await loadDataRequest.runAsync();
      showCreationModal(data.expires);
      setEditMode(true);
    },
    {
      manual: true,
      onError: () => {
        message.error('An unexpected error occurred. Please try later.');
      },
    },
  );

  const loading = loadDataRequest.loading || deleteConsentRequest.loading || createConsentRequest.loading;

  return (
    <>
      {contextHolder}
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;700&display=swap" rel="stylesheet" />
      </Head>
      <LoadingScreen show={loading}>
        <Header title="My CV" />
        <Content className="print-no-padding ubuntu-font" style={{ maxWidth: 960, margin: 'auto' }}>
          <EditViewCv
            githubId={githubId}
            consent={consent}
            data={resume}
            editMode={editMode || resume == null}
            switchView={switchView}
            onRemoveConsent={deleteConsentRequest.runAsync}
            onCreateConsent={createConsentRequest.runAsync}
            onUpdateResume={loadDataRequest.runAsync}
          />
        </Content>
      </LoadingScreen>
    </>
  );
}

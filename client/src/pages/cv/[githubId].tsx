import React, { useState } from 'react';
import { Layout } from 'antd';
import { LoadingScreen } from 'components/LoadingScreen';
import { useRouter } from 'next/router';
import withSession, { Session } from 'components/withSession';
import { Header } from 'components';
import CVInfo from 'components/cv/CVInfo';

import { OpportunitiesService } from '../../services/opportunities';
import { useAsync } from 'react-use';

const { Content } = Layout;

const cvService = new OpportunitiesService();

type Props = {
  session: Session;
};

function CVPage(props: Props) {
  const router = useRouter();

  const ownerGithubId = router?.query?.githubId as string | undefined;

  const [loading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [consent, setConsent] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);

  const switchView = async (checked: boolean) => {
    setEditMode(!checked);
  };

  const giveConsent = async (githubId: string) => {
    setLoading(true);

    const newConsent = await cvService.updateConsent(githubId, true);

    setConsent(newConsent);

    setLoading(false);
  };

  const withdrawConsent = async (githubId: string) => {
    setLoading(true);

    const newConsent = await cvService.updateConsent(githubId, false);

    setConsent(newConsent);

    setLoading(false);
  };

  const getConsent = async () => {
    if (!ownerGithubId) {
      return;
    }

    setLoading(true);

    try {
      const consent = await cvService.getConsent(ownerGithubId);
      setConsent(consent);

      setLoading(false);
    } catch (e) {
      if (e.message === 'Request failed with status code 404') {
        setNotFound(true);

        setLoading(false);
      } else {
        throw e;
      }
    }
  };

  useAsync(getConsent, [ownerGithubId]);

  const { githubId: userGithubId, isAdmin, isHirer } = props.session;

  const isOwner = userGithubId === ownerGithubId;

  const hasPriorityRole = isAdmin || isHirer;

  return (
    <>
      <LoadingScreen show={loading || !ownerGithubId}>
        <Header username={userGithubId} />
        <Layout className="cv-layout" style={{ margin: 'auto', maxWidth: '960px', backgroundColor: '#FFF' }}>
          <Content style={{ backgroundColor: '#FFF', minHeight: '60vh', margin: 'auto' }}>
            <CVInfo
              hasPriorityRole={hasPriorityRole}
              ownerGithubId={ownerGithubId}
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
      `}</style>
    </>
  );
}

export default withSession(CVPage);

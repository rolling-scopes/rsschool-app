import React, { useCallback, useEffect, useState } from 'react';
import { Layout } from 'antd';
import { LoadingScreen } from 'components/LoadingScreen';
import { NextRouter, withRouter } from 'next/router';
import withSession, { Session } from 'components/withSession';
import { Header, FooterLayout } from 'components';
import CVInfo from 'components/cv/CVInfo';

import { CVService } from '../../services/cv';

const { Content } = Layout;

const cvService = new CVService();

type Props = {
  router: NextRouter;
  session: Session;
};

type State = {
  isLoading: boolean;
  editMode: boolean;
  opportunitiesConsent: boolean | null;
  errorOccured: boolean;
};

function CVPage(props: Props) {
  const [state, setState] = useState<State>({
    isLoading: true,
    editMode: false,
    opportunitiesConsent: null,
    errorOccured: false,
  });

  const switchView = async (checked: boolean) => {
    await setState({
      ...state,
      editMode: !checked,
    });
  };

  const giveConsent = async (githubId: string) => {
    await setState({
      ...state,
      isLoading: true,
    });
    const newConsent = await cvService.changeOpportunitiesConsent(githubId, true);
    const cvExists = await cvService.checkCVExistance(githubId);
    if (!cvExists) await cvService.createEmptyCV();
    await setState({
      ...state,
      opportunitiesConsent: newConsent,
      isLoading: false,
    });
  };

  const withdrawConsent = async (githubId: string) => {
    await setState({ ...state, isLoading: true });
    const newConsent = await cvService.changeOpportunitiesConsent(githubId, false);
    await setState({
      ...state,
      opportunitiesConsent: newConsent,
      isLoading: false,
    });
  };

  const getConsent = useCallback(async () => {
    await setState({
      ...state,
      isLoading: true,
    });
    try {
      const opportunitiesConsent = await cvService.getOpportunitiesConsent(props.router.query.githubId as string);
      await setState({
        ...state,
        opportunitiesConsent,
        isLoading: false,
      });
    } catch (e) {
      await setState({
        ...state,
        errorOccured: true,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    getConsent();
  }, []);

  const { editMode, opportunitiesConsent, isLoading, errorOccured } = state;

  const userGithubId = props.session.githubId;
  const ownerGithubId = props.router.query.githubId;

  const isOwner = userGithubId === ownerGithubId;

  return (
    <>
      <LoadingScreen show={isLoading}>
        <Header username={userGithubId} />
        <Layout className="cv-layout" style={{ margin: 'auto', maxWidth: '960px', backgroundColor: '#FFF' }}>
          <Content style={{ backgroundColor: '#FFF', minHeight: '60vh', margin: 'auto' }}>
            <CVInfo
              ownerGithubId={ownerGithubId}
              isOwner={isOwner}
              errorOccured={errorOccured}
              opportunitiesConsent={opportunitiesConsent}
              editMode={editMode}
              switchView={switchView}
              withdrawConsent={withdrawConsent}
              giveConsent={giveConsent}
            />
          </Content>
        </Layout>
        <FooterLayout />
      </LoadingScreen>
      <style jsx global>{`
        @media print {
          .hide-on-print,
          .ant-avatar-icon,
          .profile,
          .footer {
            display: none !important;
          }
          .black-on-print {
            color: black !important;
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

export default withRouter(withSession(CVPage));

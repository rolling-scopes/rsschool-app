import React, { useEffect, useState } from 'react';
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

function CVPage(props: Props) {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [opportunitiesConsent, setOpportunitiesConsent] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);

  const switchView = async (checked: boolean) => {
    setEditMode(!checked);
  };

  // This is to fix an issue with empty query params
  // see: https://nextjs.org/docs/routing/dynamic-routes#caveats
  // Hack with setTimeout didn't work.
  //
  // >> After hydration, Next.js will trigger an update to your application
  // >> to provide the route parameters in the query object.
  const getGithubIdFromQuery = (router: NextRouter) => {
    const queryString = router.asPath.slice(props.router.asPath.indexOf('?') + 1);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const queryObj = Object.fromEntries(new URLSearchParams(queryString).entries());
    return queryObj?.githubid;
  };

  const giveConsent = async (githubId: string) => {
    setLoading(true);

    const newConsent = await cvService.changeOpportunitiesConsent(githubId, true);

    setOpportunitiesConsent(newConsent);

    setLoading(false);
  };

  const withdrawConsent = async (githubId: string) => {
    setLoading(true);

    const newConsent = await cvService.changeOpportunitiesConsent(githubId, false);

    setOpportunitiesConsent(newConsent);

    setLoading(false);
  };

  const getConsent = async () => {
    setLoading(true);

    try {
      const ownerGithubId = getGithubIdFromQuery(props.router);
      const opportunitiesConsent = await cvService.getOpportunitiesConsent(ownerGithubId);
      setOpportunitiesConsent(opportunitiesConsent);

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

  useEffect(() => {
    getConsent();
  }, []);

  const userGithubId = props.session.githubId;
  const ownerGithubId = getGithubIdFromQuery(props.router);

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
              notFound={notFound}
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

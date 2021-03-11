import * as React from 'react';
import { Layout, Switch, Typography, Result } from 'antd';
import { LoadingScreen } from 'components/LoadingScreen';
import { NextRouter, withRouter } from 'next/router';
import withSession, { Session } from 'components/withSession';
import { Header, FooterLayout } from 'components';
import FormCV from 'components/cv/EditCV';
import ViewCV from 'components/cv/ViewCV';
import NoConsentViewCV from 'components/cv/NoConsentViewCV';

import { UserService } from '../../services/user';

const { Content } = Layout;
const { Text } = Typography;

const userService = new UserService();

type CVInfoProps = {
  ownerId?: string | string[];
  isOwner: boolean;
  errorOccured: boolean;
  opportunitiesConsent: boolean | null;
  editMode: boolean;
  switchView: (checked: boolean) => Promise<void>;
  withdrawConsent: (ownerId: string) => void;
  giveConsent: (ownerId: string) => void;
};

function CVInfo(props: CVInfoProps) {
  const {
    ownerId,
    isOwner,
    errorOccured,
    opportunitiesConsent,
    editMode,
    switchView,
    withdrawConsent,
    giveConsent,
  } = props;

  if (errorOccured) {
    return <Result status={404} title="User not found" />;
  }

  if (ownerId === undefined || ownerId instanceof Array) {
    return <Result status="warning" title="This page doesn't exist" />;
  }

  if (isOwner) {
    if (opportunitiesConsent) {
      return (
        <>
          <Text className="hide-on-print">Switch view:</Text>
          <Switch
            className="hide-on-print"
            style={{ marginLeft: '5px' }}
            defaultChecked={!editMode}
            onChange={switchView}
            checkedChildren="CV view"
            unCheckedChildren="Edit view"
          />
          {editMode ? (
            <FormCV ownerId={ownerId} withdrawConsent={() => withdrawConsent(ownerId as string)} />
          ) : (
            <ViewCV ownerId={ownerId} />
          )}
        </>
      );
    } else {
      return <NoConsentViewCV isOwner={true} giveConsent={() => giveConsent(ownerId as string)} />;
    }
  } else {
    if (opportunitiesConsent) {
      return <ViewCV ownerId={ownerId} />;
    } else {
      return <NoConsentViewCV isOwner={false} />;
    }
  }
}

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

class CVPage extends React.Component<Props, State> {
  state: State = {
    isLoading: true,
    editMode: false,
    opportunitiesConsent: null,
    errorOccured: false,
  };

  private async switchView(checked: boolean) {
    await this.setState({
      editMode: !checked,
    });
  }

  private async giveConsent(githubId: string) {
    await this.setState({ isLoading: true });
    const newConsent = await userService.changeOpportunitiesConsent(githubId, true);
    await this.setState({
      opportunitiesConsent: newConsent,
      isLoading: false,
    });
  }

  private async withdrawConsent(githubId: string) {
    await this.setState({ isLoading: true });
    const newConsent = await userService.changeOpportunitiesConsent(githubId, false);
    await this.setState({
      opportunitiesConsent: newConsent,
      isLoading: false,
    });
  }

  async componentDidMount() {
    await this.setState({ isLoading: true });
    try {
      const opportunitiesConsent = await userService.getOpportunitiesConsent(
        this.props.router.query.githubId as string,
      );
      await this.setState({ opportunitiesConsent, isLoading: false });
    } catch (e) {
      await this.setState({
        errorOccured: true,
        isLoading: false,
      });
    }
  }

  render() {
    const { editMode, opportunitiesConsent, isLoading, errorOccured } = this.state;

    const userGithubId = this.props.session.githubId;
    const ownerId = this.props.router.query.githubId;

    const isOwner = userGithubId === ownerId;

    return (
      <>
        <LoadingScreen show={isLoading}>
          <Header username={userGithubId} />
          <Layout className="cv-layout" style={{ margin: 'auto', maxWidth: '960px', backgroundColor: '#FFF' }}>
            <Content style={{ backgroundColor: '#FFF', minHeight: '500px', margin: 'auto' }}>
              <CVInfo
                ownerId={ownerId}
                isOwner={isOwner}
                errorOccured={errorOccured}
                opportunitiesConsent={opportunitiesConsent}
                editMode={editMode}
                switchView={this.switchView.bind(this)}
                withdrawConsent={this.withdrawConsent.bind(this)}
                giveConsent={this.giveConsent.bind(this)}
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
}

export default withRouter(withSession(CVPage));

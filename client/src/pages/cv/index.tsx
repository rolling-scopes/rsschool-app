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

const userService = new UserService();

class CVPage extends React.Component<Props, State> {
  state: State = {
    isLoading: true,
    editMode: false,
    opportunitiesConsent: null,
    errorOccured: false,
  };

  private async switchView(checked: boolean) {
    if (checked) {
      await this.setState({
        editMode: false,
      });
    } else {
      await this.setState({
        editMode: true,
      });
    }
  }

  private async giveConsent(githubId: string) {
    await this.setState({ isLoading: true });
    const newConsent = await userService.changeOpportunitiesConsent(githubId, true);
    await this.setState({
      opportunitiesConsent: newConsent,
    });
    await this.setState({ isLoading: false });
  }

  private async withdrawConsent(githubId: string) {
    await this.setState({ isLoading: true });
    const newConsent = await userService.changeOpportunitiesConsent(githubId, false);
    await this.setState({
      opportunitiesConsent: newConsent,
    });
    await this.setState({ isLoading: false });
  }

  async componentDidMount() {
    await this.setState({ isLoading: true });
    try {
      const opportunitiesConsent = await userService.getOpportunitiesConsent(
        this.props.router.query.githubId as string,
      );
      await this.setState({ opportunitiesConsent });
    } catch (e) {
      await this.setState({
        errorOccured: true,
      });
    }
    await this.setState({ isLoading: false });
  }

  render() {
    const { editMode, opportunitiesConsent, isLoading, errorOccured } = this.state;

    const userGithubId = this.props.session.githubId;
    const ownerId = this.props.router.query.githubId;

    const isOwner = userGithubId === ownerId;

    let content;

    if (errorOccured) {
      return <Result status={404} title="User not found" />;
    }

    if (ownerId === undefined || ownerId instanceof Array) {
      content = <Result status="warning" title="This page doesn't exist" />;
    } else {
      if (isOwner) {
        if (opportunitiesConsent) {
          content = (
            <>
              <Text className="hide-on-print">Switch view:</Text>
              <Switch
                className="hide-on-print"
                style={{ marginLeft: '5px' }}
                defaultChecked={!editMode}
                onChange={this.switchView.bind(this)}
                checkedChildren="CV view"
                unCheckedChildren="Edit view"
              />
              {editMode ? (
                <FormCV ownerId={ownerId} withdrawConsent={() => this.withdrawConsent(ownerId as string)} />
              ) : (
                <ViewCV ownerId={ownerId} />
              )}
            </>
          );
        } else {
          content = <NoConsentViewCV isOwner={true} giveConsent={() => this.giveConsent(ownerId as string)} />;
        }
      } else {
        if (opportunitiesConsent) {
          content = <ViewCV ownerId={ownerId} />;
        } else {
          content = <NoConsentViewCV isOwner={false} />;
        }
      }
    }

    return (
      <>
        <LoadingScreen show={isLoading}>
          <Header username={userGithubId} />
          <Layout className="cv-layout" style={{ margin: 'auto', maxWidth: '960px', backgroundColor: '#FFF' }}>
            <Content style={{ backgroundColor: '#FFF', minHeight: '500px', margin: 'auto' }}>{content}</Content>
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

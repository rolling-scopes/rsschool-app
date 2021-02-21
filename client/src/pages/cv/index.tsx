import * as React from 'react';
import { Layout, Switch, Typography } from 'antd';
import { LoadingScreen } from 'components/LoadingScreen';
import { NextRouter, withRouter } from 'next/router';
import withSession, { Session } from 'components/withSession';
import { Header, FooterLayout } from 'components';
import FormCV from 'components/CV/EditCV';
import ViewCV from 'components/CV/ViewCV';
import NoConsentViewCV from 'components/CV/NoConsentViewCV';

import { UserService } from '../../services/user';

const { Content } = Layout;
const { Text, Title } = Typography;

type Props = {
  router: NextRouter;
  session: Session;
};

type State = {
  isLoading: boolean;
  editMode: boolean;
  opportunitiesConsent: boolean | null;
};

class CVPage extends React.Component<Props, State> {
  state: State = {
    isLoading: true,
    editMode: false,
    opportunitiesConsent: null
  };

  private userService = new UserService();

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
    const newConsent = await this.userService.changeOpportunitiesConsent(githubId, true);
    await this.setState({
      opportunitiesConsent: newConsent
    });
    await this.setState({ isLoading: false });
  }

  private async withdrawConsent(githubId: string) {
    await this.setState({ isLoading: true });
    const newConsent = await this.userService.changeOpportunitiesConsent(githubId, false);
    await this.setState({
      opportunitiesConsent: newConsent
    });
    await this.setState({ isLoading: false });
  }

  async componentDidMount() {
    await this.setState({ isLoading: true });
    const opportunitiesConsent = await this.userService.getOpportunitiesConsent(this.props.router.query.githubId as string);
    await this.setState({ opportunitiesConsent });
    await this.setState({ isLoading: false });
  }

  render() {

    const { editMode, opportunitiesConsent, isLoading } = this.state;

    const userGithubId = this.props.session.githubId;
    const ownerId = this.props.router.query.githubId;

    const isOwner = userGithubId === ownerId;

    let content;

    if (ownerId === undefined || ownerId instanceof Array) {
      content = <Title>This page doesn't exist</Title>;
    } else {
      if (isOwner) {
        if (opportunitiesConsent) {
          content = (
            <>
              <Text className='hide-on-print'>Switch view:</Text>
              <Switch
                className='hide-on-print'
                style={{ marginLeft: '5px' }}
                defaultChecked={!editMode}
                onChange={this.switchView.bind(this)}
                checkedChildren="CV view"
                unCheckedChildren="Edit view"
              />
              {editMode ? <FormCV ownerId={ownerId} withdrawConsent={() => this.withdrawConsent(ownerId as string)} /> : <ViewCV ownerId={ownerId} />}
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
          <Layout style={{ margin: 'auto', maxWidth: '960px', backgroundColor: '#FFF' }}>
            <Content style={{ backgroundColor: '#FFF', minHeight: '500px', margin: 'auto' }}>
              {content}
            </Content>
          </Layout>
          <FooterLayout />
        </LoadingScreen>
        <style jsx global>{`
          @media print {
            .hide-on-print, .ant-avatar-icon, .profile, .footer {
              display: none !important;
            }
            .hide-border-on-print {
              border: none !important;
            }
          }
      `}</style>
      </>
    );
  }
}



export default withRouter(withSession(CVPage));

import * as React from 'react';
import {
  Result,
} from 'antd';
import { Header } from 'components/Header';
import { NextRouter, withRouter } from 'next/router';
import { LoadingScreen } from 'components/LoadingScreen';
import withSession, { Session } from 'components/withSession';
import { UserService, ProfileResponse } from 'services/user';

type Props = {
  router: NextRouter;
  session: Session;
};

type State = {
  profile: ProfileResponse | null;
  isLoading: boolean;
};

class ProfilePage extends React.Component<Props, State> {
  state: State = {
    isLoading: true,
    profile: null,
  };

  private userService = new UserService();

  private fetchData = async () => {
    this.setState({ isLoading: true });

    const { router } = this.props;

    try {
      const githubId = router.query ? (router.query.githubId as string) : '';
      const profile = await this.userService.getProfileInfo(githubId)

      console.log(profile);

      this.setState({ isLoading: false, profile });
      // this.setState({ isLoading: false, profile, user });
    } catch (e) {
      this.setState({ isLoading: false, profile: null });
    }
  };

  async componentDidMount() {
    await this.fetchData();
  }

  async componentDidUpdate(prevProps: { router: { query?: any } }) {
    if (prevProps.router.query.githubId !== this.props.router.query!.githubId) {
      await this.fetchData();
    }
  }

  render() {
    return (
      <>
        <LoadingScreen show={this.state.isLoading}>
          <Header username={this.props.session.githubId} />
          {
            this.state.profile
              ? <>
                Profile
              </>
              : <>
                <Result status="403" title="No access or user does not exist" />
              </>
          }
        </LoadingScreen>
      </>
    );
  }
}

export default withRouter(withSession(ProfilePage));

import * as React from 'react';
import { Layout, Space } from 'antd';
import { NextRouter, withRouter } from 'next/router';
import withSession, { Session } from 'components/withSession';
import { LoadingScreen } from 'components/LoadingScreen';
import MainSection from 'components/cv/MainSection';
import { mockContactsList, mockUserData } from './mockData';

const { Content } = Layout;

type Props = {
  router: NextRouter;
  session: Session;
};

type State = {
  isLoading: boolean;
};

class CVPage extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
  };

  render() {
    return (
      <>
        <LoadingScreen show={this.state.isLoading}>
          <Layout style={{ paddingTop: '30px', margin: 'auto', maxWidth: '960px' }}>
            <Content>
              <Space direction="vertical" style={{ width: '100%' }}>
                <MainSection
                  contacts={mockContactsList}
                  name={mockUserData.name}
                  desiredPosition={mockUserData.desiredPosition}
                />
              </Space>
            </Content>
          </Layout>
        </LoadingScreen>
      </>
    );
  }
}

export default withRouter(withSession(CVPage));

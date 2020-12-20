import * as React from 'react';
import { Layout, Switch } from 'antd';
import { NextRouter, withRouter } from 'next/router';
import withSession, { Session } from 'components/withSession';
import { Header, FooterLayout } from 'components';
import FormCV from 'components/cv/FormCV';
import ViewCV from 'components/cv/ViewCV';

const { Content } = Layout;

type Props = {
  router: NextRouter;
  session: Session;
};

type State = {
  isLoading: boolean;
  editMode: boolean;
};

class CVPage extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
    editMode: true,
  };

  private switchView(checked: boolean) {
    if (checked) {
      this.setState({
        editMode: true,
      });
    } else {
      this.setState({
        editMode: false,
      });
    }
  }

  render() {
    const { editMode } = this.state;
    const githubId = this.props.session.githubId;

    return (
      <>
        <Header username={githubId} />
        <Layout style={{ paddingTop: '30px', margin: 'auto', maxWidth: '960px' }}>
          <Content>
            <label>
              Switch view:
              <br />
              <Switch
                defaultChecked={editMode}
                onChange={this.switchView.bind(this)}
                checkedChildren="CV view"
                unCheckedChildren="Form view"
              />
            </label>
            {editMode ? <ViewCV /> : <FormCV ownerId={githubId} />}
          </Content>
        </Layout>
        <FooterLayout />
      </>
    );
  }
}

export default withRouter(withSession(CVPage));

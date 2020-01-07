import { Button, Col, Form, Input, message, Typography } from 'antd';
import { Header } from 'components/Header';
import { LoadingScreen } from 'components/LoadingScreen';
import { PersonSelect } from 'components/PersonSelect';
import { UserSearch } from 'components/UserSearch';
import withSession, { Session } from 'components/withSession';
import { NextRouter, withRouter } from 'next/router';
import * as React from 'react';
import { UserService } from 'services/user';

type Props = {
  router: NextRouter;
  session: Session;
};

type State = {
  user: { id: number; githubId: string } | null;
  isLoading: boolean;
};

class PrivateFeedbackPage extends React.Component<Props, State> {
  state: State = {
    user: null,
    isLoading: false,
  };

  private userService = new UserService();

  componentDidMount() {
    const { router } = this.props;
    const githubId = router.query ? (router.query.githubId as string) : null;
    const userId = router.query ? (router.query.userId as string) : null;
    this.setState({
      user: githubId && userId ? { githubId, id: Number(userId) } : null,
    });
  }

  render() {
    return (
      <>
        <Header username={this.props.session.githubId} title="Private Feedback" />
        <Col className="m-2" sm={12}>
          <Typography.Text type="secondary">
            Your feedback will be visible to course administrator/manager only
          </Typography.Text>
          <LoadingScreen show={this.state.isLoading}>
            <Form initialValues={getInitialValues(this.state.user)} onFinish={this.handleSubmit}>
              <Form.Item name="userId" label="Person" rules={[{ required: true, message: 'Please select a person' }]}>
                {this.state.user ? <PersonSelect data={[this.state.user]} /> : <UserSearch searchFn={this.loadUsers} />}
              </Form.Item>
              <Form.Item
                name="comment"
                label="Comment"
                rules={[
                  {
                    required: true,
                    min: 20,
                    whitespace: true,
                    message: 'Please give us more details',
                  },
                ]}
              >
                <Input.TextArea style={{ height: 200 }} />
              </Form.Item>
              <Button size="large" type="primary" htmlType="submit">
                Submit
              </Button>
            </Form>
          </LoadingScreen>
        </Col>
      </>
    );
  }

  private loadUsers = async (searchText: string) => {
    return this.userService.searchUser(searchText);
  };

  private handleSubmit = async (values: any) => {
    try {
      this.setState({ isLoading: true });
      await this.userService.submitPrivateFeedback({
        toUserId: values.userId,
        comment: values.comment,
      });
      message.success('Your feedback has been submitted.');
      this.setState({ isLoading: false });
    } catch (e) {
      message.success('An error occured. Please try later.');
      this.setState({ isLoading: false });
    }
  };
}

function getInitialValues(user) {
  return {
    userId: user ? user.id : undefined,
  };
}

export default withRouter(withSession(PrivateFeedbackPage));

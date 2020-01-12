import { Button, Col, Input, Form, message, Typography } from 'antd';
import { Header } from 'components/Header';
import { LoadingScreen } from 'components/LoadingScreen';
import { UserSearch } from 'components/UserSearch';
import withSession, { Session } from 'components/withSession';
import * as React from 'react';
import { GratitudeService } from 'services/gratitude';
import { UserService } from 'services/user';
import heroesBadges from '../configs/heroes-badges';

type Props = {
  session: Session;
};

type Badge = {
  id: string;
  name: string;
};

type State = {
  badges: Badge[];
  isLoading: boolean;
};

class GratitudePage extends React.Component<Props, State> {
  state: State = {
    badges: Object.entries(heroesBadges).map(([id, { name }]) => ({ id, name })),
    isLoading: false,
  };

  private userService = new UserService();
  private gratitudeService = new GratitudeService();

  render() {
    return (
      <>
        <Header title="#gratitude" username={this.props.session.githubId} />
        <Col className="m-2" sm={12}>
          <Typography.Text type="secondary">
            Your feedback will be posted to #gratitude channel and to the Profile page of selected person
          </Typography.Text>
          <LoadingScreen show={this.state.isLoading}>
            <Form onFinish={this.handleSubmit}>
              <Form.Item name="userId" label="Person" rules={[{ required: true, message: 'Please select a person' }]}>
                <UserSearch searchFn={this.loadUsers} />
              </Form.Item>
              <Form.Item
                name="comment"
                label="Comment"
                rules={[
                  {
                    required: true,
                    min: 20,
                    whitespace: true,
                    message: 'The comment must contain at least 20 characters',
                  },
                ]}
              >
                <Input.TextArea rows={5} />
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
      await this.gratitudeService.postGratitude({
        toUserId: values.userId,
        comment: values.comment,
      });
      message.success('Your feedback has been submitted.');
      this.setState({ isLoading: false });
    } catch (e) {
      message.error('An error occurred. Please try later.');
      this.setState({ isLoading: false });
    }
  };
}

export default withSession(GratitudePage);

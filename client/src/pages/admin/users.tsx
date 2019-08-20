import * as React from 'react';
import { Button, Col, Form, Input, List, Row } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { GithubAvatar, Header, Session, withSession } from 'components';
import { UserService } from 'services/user';

type Props = {
  session: Session;
} & FormComponentProps;

type State = {
  users: any[] | null;
};

class Users extends React.Component<Props, State> {
  state: State = {
    users: null,
  };

  private userService = new UserService();

  handleSearch = async (event: any) => {
    event.preventDefault();
    const values = this.props.form.getFieldsValue();
    if (!values.searchText) {
      return;
    }
    const users = await this.userService.searchUser(values.searchText);
    this.setState({ users });
  };

  render() {
    const { getFieldDecorator: field } = this.props.form;
    return (
      <>
        <Header title="Users" username={this.props.session.githubId} />
        <div className="mt-4">
          <Form layout="horizontal" onSubmit={this.handleSearch}>
            <Row gutter={24}>
              <Col offset={1} xs={16} sm={12} md={8} lg={6}>
                <Form.Item>
                  {field('searchText')(<Input width={200} placeholder="Search by github or name" />)}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item>
                  <Button type="primary">Search</Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
          {this.state.users && (
            <Row>
              <Col offset={2} xs={20} sm={16} md={10} lg={8}>
                <List
                  rowKey="id"
                  locale={{ emptyText: 'No results' }}
                  dataSource={this.state.users}
                  renderItem={(user: any) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<GithubAvatar size={48} githubId={user.githubId} />}
                        title={<a href={`/profile?githubId=${user.githubId}`}>{user.githubId}</a>}
                        description={`${user.firstName} ${user.lastName}`}
                      />
                    </List.Item>
                  )}
                />
              </Col>
            </Row>
          )}
        </div>
      </>
    );
  }
}

export default withSession(Form.create()(Users));

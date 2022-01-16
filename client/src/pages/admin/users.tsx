import { useState, useMemo } from 'react';
import { Button, Col, Input, List, Row, Layout, Form } from 'antd';
import { GithubAvatar, Header, Session, withSession, AdminSider } from 'components';
import { UserService, UserFull } from 'services/user';

const { Content } = Layout;
type Props = { session: Session };

function Page(props: Props) {
  const [users, setUsers] = useState(null as any[] | null);
  const userService = useMemo(() => new UserService(), []);

  const handleSearch = async (values: any) => {
    if (!values.searchText) {
      return;
    }
    const users = await userService.extendedUserSearch(values.searchText);
    setUsers(users);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSider isAdmin={props.session.isAdmin} />
      <Layout style={{ background: '#fff' }}>
        <Header title="Users" username={props.session.githubId} />
        <Content>
          <div className="mt-4">
            <Form layout="horizontal" onFinish={handleSearch}>
              <Row gutter={24}>
                <Col offset={1} xs={16} sm={12} md={8} lg={6}>
                  <Form.Item name="searchText">
                    <Input width={200} placeholder="Search by github or name" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Search
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            {users && (
              <Row>
                <Col offset={2} xs={20} sm={16} md={10} lg={8}>
                  <List
                    rowKey="id"
                    locale={{ emptyText: 'No results' }}
                    dataSource={users}
                    renderItem={(user: UserFull) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<GithubAvatar size={48} githubId={user.githubId} />}
                          title={<a href={`/profile?githubId=${user.githubId}`}>{user.githubId}</a>}
                          description={
                            <div>
                              <div>{user.name}</div>
                              <div>{`Primary email: ${user.primaryEmail || ''}`}</div>
                              <div>{`EPAM email: ${user.contactsEpamEmail || ''}`}</div>
                              <div>{`Skype: ${user.contactsSkype || ''}`}</div>
                              <div>{`Telegram: ${user.contactsTelegram || ''}`}</div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Col>
              </Row>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default withSession(Page);

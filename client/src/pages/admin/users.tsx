import { useState, useMemo } from 'react';
import { Button, Col, Input, List, Row, Layout, Form } from 'antd';
import { GithubAvatar } from 'components/GithubAvatar';
import { Session, withSession } from 'components/withSession';
import { UserService, UserFull } from 'services/user';
import { AdminPageLayout } from 'components/PageLayout';
import { getCoursesProps as getServerSideProps } from 'modules/Course/data/getCourseProps';
import { Course } from 'services/models';

const { Content } = Layout;
type Props = { session: Session; courses: Course[] };

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
    <AdminPageLayout session={props.session} title="Users" loading={false} courses={props.courses}>
      <Content>
        <div className="mt-4">
          <Form layout="horizontal" onFinish={handleSearch}>
            <Row gutter={12}>
              <Col span={6}>
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
    </AdminPageLayout>
  );
}

export { getServerSideProps };

export default withSession(Page);

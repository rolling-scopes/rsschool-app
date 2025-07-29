import { useState } from 'react';
import { Button, Col, Input, List, Row, Layout, Form } from 'antd';
import { GithubAvatar } from 'components/GithubAvatar';
import { AdminPageLayout } from 'components/PageLayout';
import { CourseRole } from 'services/models';
import { ActiveCourseProvider, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';
import { UsersApi, UserSearchDto } from 'api';

const { Content } = Layout;

const userApi = new UsersApi();

function Page() {
  const { courses } = useActiveCourseContext();
  const [users, setUsers] = useState(null as UserSearchDto[] | null);

  const handleSearch = async (values: any) => {
    if (!values.searchText) {
      return;
    }
    const users = await userApi.searchUsers(values.searchText);
    setUsers(users.data);
  };

  return (
    <AdminPageLayout title="Users" loading={false} courses={courses}>
      <Content>
        <div className="mt-4">
          <Form layout="horizontal" onFinish={handleSearch}>
            <Row gutter={12}>
              <Col span={6}>
                <Form.Item name="searchText">
                  <Input allowClear={true} type='search' width={200} placeholder="Search by github or name" />
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
                  renderItem={user => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<GithubAvatar size={48} githubId={user.githubId} />}
                        title={<a href={`/profile?githubId=${user.githubId}`}>{user.githubId}</a>}
                        description={
                          <>
                            <UserField value={user.name} />
                            <UserField label="Primary Email" value={user.primaryEmail} />
                            <UserField label="Contacts Email" value={user.contactsEmail} />
                            <UserField label="Contacts EPAM Email" value={user.contactsEpamEmail} />
                            <UserField label="Contacts Telegram" value={user.contactsTelegram} />
                            <UserField label="Contacts Discord" value={user.contactsDiscord} />
                            <UserField label="Mentor" value={user.mentors?.map(({ courseName }) => courseName)} />
                            <UserField label="Student" value={user.students?.map(({ courseName }) => courseName)} />
                          </>
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

function UserField({ label, value }: { label?: string; value: string | string[] | null | undefined }) {
  const valueStr = Array.isArray(value) ? value.join(', ') : value;
  if (!valueStr) {
    return null;
  }
  return (
    <div>
      {label ? <span>{label}: </span> : null}
      <span>{valueStr}</span>
    </div>
  );
}

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Manager]} anyCoursePowerUser>
        <Page />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}

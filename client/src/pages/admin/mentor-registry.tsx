import { Col, Layout, Spin, Table } from 'antd';
import { AdminSider, GithubUserLink, Header } from 'components';
import { stringSorter, boolIconRenderer, tagsRenderer } from 'components/Table';
import withSession, { Session } from 'components/withSession';
import { useState } from 'react';
import { useAsync } from 'react-use';
import { MentorRegistry, MentorRegistryService } from 'services/mentorRegistry';
import { Course } from 'services/models';

const { Content } = Layout;
const PAGINATION = 200;

type Props = { courses: Course[]; session: Session };

function Page(props: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useAsync(async () => {
    setLoading(true);
    const service = new MentorRegistryService();
    const data = await service.getMentors();
    setData(data);
    setLoading(false);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSider />
      <Layout style={{ background: '#fff' }}>
        <Header title="Mentor Registry" username={props.session.githubId} />
        <Content style={{ margin: 8 }}>
          <Spin spinning={loading}>
            <Col>
              <Table<MentorRegistry>
                bordered
                pagination={{ pageSize: PAGINATION }}
                size="small"
                rowKey="githubId"
                dataSource={data}
                columns={[
                  {
                    title: 'Name',
                    dataIndex: 'name',
                    width: 150,
                    sorter: stringSorter('name'),
                  },
                  {
                    title: 'Github',
                    dataIndex: 'githubId',
                    width: 120,
                    sorter: stringSorter('githubId'),
                    render: (value: string) => <GithubUserLink value={value} />,
                  },
                  {
                    title: 'City',
                    dataIndex: 'locationName',
                    width: 80,
                  },
                  {
                    title: 'Courses',
                    dataIndex: 'preferedCourses',
                    render: tagsRenderer,
                  },
                  {
                    title: 'Max students',
                    dataIndex: 'maxStudentsLimit',
                    width: 80,
                  },
                  {
                    title: 'Students Location',
                    dataIndex: 'preferedStudentsLocation',
                    width: 120,
                    sorter: stringSorter('githubId'),
                  },
                  {
                    title: 'English Mentoring',
                    dataIndex: 'englishMentoring',
                    render: boolIconRenderer,
                    width: 80,
                  },
                  {
                    title: 'Technical Mentoring',
                    dataIndex: 'technicalMentoring',
                    render: tagsRenderer,
                  },
                  {
                    title: 'Comment',
                    dataIndex: 'comment',
                  },
                ]}
              />
            </Col>
          </Spin>
        </Content>
      </Layout>
    </Layout>
  );
}

export default withSession(Page);

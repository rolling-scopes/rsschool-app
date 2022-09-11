import { Button, Col, Divider, List, message, Row, Tag, Typography } from 'antd';
import {
  LinkOutlined,
  LaptopOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { PageLayout } from 'components/PageLayout';
import { SessionContext } from 'modules/Course/contexts';
import { useCallback, useContext, useState } from 'react';
import { JobPostDtoJobTypeEnum, JobPostsApi, JobPostDto } from 'api';
import { useAsync } from 'react-use';
import { JobPostModal } from 'modules/Job/components/JobPostModal';

const jobPostApi = new JobPostsApi();

export function JobPage() {
  const session = useContext(SessionContext);

  const [modal, setModal] = useState<Record<string, string> | null>(null);

  const { value: jobPosts, loading } = useAsync(async () => {
    const { data } = await jobPostApi.getJobPosts();
    return data;
  });

  const createJobPost = useCallback(async (jobPost: any) => {
    await jobPostApi.createJobPost(jobPost);
    setModal(null);
    message.info('Your job post has been sent to review');
  }, []);

  return (
    <PageLayout githubId={session.githubId} loading={loading}>
      <Typography style={{ marginBottom: 8 }}>
        <Typography.Title level={3}>Job Posts</Typography.Title>
        <Typography.Text>You can post a job here.</Typography.Text>
      </Typography>
      <Button type="primary" onClick={() => setModal({})}>
        Post a Job
      </Button>
      <JobPostModal onCancel={() => setModal(null)} onSubmit={createJobPost} data={modal} />
      <Divider />
      <Typography style={{ marginBottom: 8 }}>
        <Typography.Title level={4}>Available Job Posts</Typography.Title>
      </Typography>
      <Row>
        <Col md={24} xs={24} xl={16} xxl={16} sm={24}>
          <List
            size="large"
            dataSource={jobPosts ?? []}
            itemLayout="vertical"
            locale={{ emptyText: 'No job posts available for you' }}
            renderItem={item => (
              <List.Item
                key={item.title}
                actions={[
                  <Button icon={<CheckCircleOutlined />} type="dashed">
                    Apply
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    item.url ? (
                      <a href={item.url} target="_blank">
                        <LinkOutlined /> {item.title}
                      </a>
                    ) : (
                      item.title
                    )
                  }
                  description={<JobTags item={item} />}
                />
                <span style={{ color: '#666' }}>{item.description}</span>
              </List.Item>
            )}
          ></List>
        </Col>
      </Row>
    </PageLayout>
  );
}

function JobTypeTag(props: { type: JobPostDtoJobTypeEnum }) {
  let label = '';
  switch (props.type) {
    case JobPostDtoJobTypeEnum.Remote:
      label = 'Remote';
      break;
    case JobPostDtoJobTypeEnum.Office:
      label = 'Office';
      break;
    case JobPostDtoJobTypeEnum.Hybrid:
      label = 'Hybrid';
      break;
  }
  return label ? (
    <Tag>
      <LaptopOutlined /> {label}
    </Tag>
  ) : null;
}

function JobTags({ item }: { item: JobPostDto }) {
  return (
    <>
      <JobTypeTag type={item.jobType} />
      <Tag>
        <EnvironmentOutlined /> {item.location}
      </Tag>
      <Tag>
        <TeamOutlined /> {item.company}
      </Tag>
    </>
  );
}

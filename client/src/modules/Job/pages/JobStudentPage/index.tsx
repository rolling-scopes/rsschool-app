import {
  CheckCircleOutlined,
  EnvironmentOutlined,
  LaptopOutlined,
  LinkOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Col, List, message, Row, Tag, Typography } from 'antd';
import { JobPostDto, JobPostDtoJobTypeEnum, JobPostsApi } from 'api';
import { PageLayout } from 'components/PageLayout';
import { SessionContext } from 'modules/Course/contexts';
import { useContext } from 'react';
import { useAsync } from 'react-use';

const jobPostApi = new JobPostsApi();

export function JobStudentPage() {
  const session = useContext(SessionContext);

  const { value: jobPosts, loading } = useAsync(async () => {
    const { data } = await jobPostApi.getJobPosts();
    return data;
  });

  return (
    <PageLayout githubId={session.githubId} loading={loading}>
      <Typography style={{ marginBottom: 8 }}>
        <Typography.Title level={3}>Job Posts</Typography.Title>
        <Typography.Paragraph italic>Please make sure you created CV before checking job posts</Typography.Paragraph>
      </Typography>
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
                className="rs-job-post-item"
                key={item.title}
                actions={[
                  <Button onClick={() => message.info('Not implemented')} icon={<CheckCircleOutlined />}>
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
                <Typography.Paragraph type="secondary">{item.description}</Typography.Paragraph>
              </List.Item>
            )}
          ></List>
        </Col>
      </Row>
      <style jsx global>
        {`
          .rs-job-post-item.ant-list-item:hover {
            background-color: #f3f3f3;
          }
        `}
      </style>
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

import { EnvironmentOutlined, LaptopOutlined, LinkOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Col, Divider, List, message, Row, Tag, Typography } from 'antd';
import { JobPostDto, JobPostDtoJobTypeEnum, JobPostDtoStatusEnum, JobPostsApi } from 'api';
import { PageLayout } from 'components/PageLayout';
import { SessionContext } from 'modules/Course/contexts';
import { JobPostModal } from 'modules/Job/components/JobPostModal';
import { useCallback, useContext, useState } from 'react';
import { useAsync } from 'react-use';

const jobPostApi = new JobPostsApi();

export function JobEmployerPage() {
  const session = useContext(SessionContext);

  const [modal, setModal] = useState<Record<string, string> | null>(null);

  const { value: jobPosts, loading } = useAsync(async () => {
    const { data } = await jobPostApi.getMyJobPosts();
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
        <Typography>
          <a target="_blank" href="https://job.rs.school">
            job.rs.school
          </a>{' '}
          allows you to find and hire{' '}
          <a target="_blank" href="https://rs.school">
            Rolling Scopes School
          </a>{' '}
          graduates. Every year thousands of students pass RS School cources around of the globe.
        </Typography>
        <Typography.Title level={5}>How It Works</Typography.Title>
        <Typography.Paragraph>- You post a job</Typography.Paragraph>
        <Typography.Paragraph>- We review it</Typography.Paragraph>
        <Typography.Paragraph>- Your post becomes available for the best students</Typography.Paragraph>
        <Typography.Paragraph>- Students apply</Typography.Paragraph>
        <Typography.Paragraph>- You get access to student CVs and profiles</Typography.Paragraph>
      </Typography>
      <Button type="primary" onClick={() => setModal({})}>
        Post a Job
      </Button>
      <JobPostModal onCancel={() => setModal(null)} onSubmit={createJobPost} data={modal} />
      <Divider />

      {jobPosts?.length ? (
        <>
          <Typography style={{ marginBottom: 8 }}>
            <Typography.Title level={4}>My Job Posts</Typography.Title>
          </Typography>
          <Row>
            <Col md={24} xs={24} xl={16} xxl={16} sm={24}>
              <List
                size="large"
                dataSource={jobPosts ?? []}
                itemLayout="vertical"
                renderItem={item => (
                  <List.Item key={item.title} actions={[<Button danger>Disable</Button>]}>
                    <List.Item.Meta
                      title={
                        <>
                          <JobStatusTag status={item.status} />
                          {item.url ? (
                            <a href={item.url} target="_blank">
                              <LinkOutlined /> {item.title}
                            </a>
                          ) : (
                            item.title
                          )}
                        </>
                      }
                      description={<JobTags item={item} />}
                    />
                    <span style={{ color: '#666' }}>{item.description}</span>
                  </List.Item>
                )}
              ></List>
            </Col>
          </Row>
        </>
      ) : null}
    </PageLayout>
  );
}

function JobStatusTag(props: { status: JobPostDtoStatusEnum }) {
  switch (props.status) {
    case JobPostDtoStatusEnum.Review:
      return <Tag color="orange">Review</Tag>;
    case JobPostDtoStatusEnum.Published:
      return <Tag color="green">Published</Tag>;
    case JobPostDtoStatusEnum.Inactive:
      return <Tag color="red">Inactive</Tag>;
    default:
      return null;
  }
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

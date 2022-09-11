import { Button, Card, Row, Typography } from 'antd';
import { PageLayout } from 'components/PageLayout';
import { SessionContext } from 'modules/Course/contexts';
import { useContext } from 'react';

export function JobPage() {
  const session = useContext(SessionContext);

  return (
    <PageLayout githubId={session.githubId} loading={false}>
      <Typography.Title level={3}>Who are you?</Typography.Title>
      <Row>
        <Card
          hoverable
          style={{ width: 240, marginRight: 32, marginBottom: 32 }}
          cover={<img src="https://www.assessmentcentrehq.com/wp-content/uploads/2021/12/current-employer.jpg" />}
        >
          <Card.Meta
            title={<Typography.Title level={4}>Employer</Typography.Title>}
            description={
              <Button href="/job/employer" size="large">
                Post a job
              </Button>
            }
          />
        </Card>
        <Card
          hoverable
          style={{ width: 240, marginRight: 32, marginBottom: 32 }}
          cover={
            <img src="https://media.istockphoto.com/photos/beautiful-smiling-female-college-student-picture-id1340766096?k=20&m=1340766096&s=170667a&w=0&h=ZY51uilXGtfJ7ZUX9U3Bf-IQ021gWXoE-qEfv9iilFs=" />
          }
        >
          <Card.Meta
            title={<Typography.Title level={4}>Student</Typography.Title>}
            description={
              <Button href="/job/student" size="large">
                Find a job
              </Button>
            }
          />
        </Card>
      </Row>
    </PageLayout>
  );
}

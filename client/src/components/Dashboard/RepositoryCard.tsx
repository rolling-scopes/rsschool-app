import { GithubFilled, WarningTwoTone } from '@ant-design/icons';
import { Button, Col, message, Modal, Row, Spin, Typography } from 'antd';
import { useLoading } from 'components/useLoading';
import CommonCard from './CommonDashboardCard';

type Props = {
  url?: string;
  githubId: string;
  onSendInviteRepository: (githubId: string) => Promise<void>;
  updateUrl: () => void;
};

const getNameGithubRepository = (url: string | null | undefined) => (url ? url.split('/').pop() ?? '' : '');

export function RepositoryCard(props: Props) {
  const { Text, Paragraph } = Typography;
  const { url, githubId, onSendInviteRepository, updateUrl } = props;
  const nameGithubRepository = getNameGithubRepository(url);
  const [loading, withLoading] = useLoading(false);

  const showInformation = () => {
    Modal.info({
      okText: 'Got it',
      icon: <WarningTwoTone twoToneColor="red" />,
      title: <h3 style={{ color: 'red' }}>Important</h3>,
      content: (
        <div>
          <p>GitHub will automatically send you an invite to access your private repository.</p>
          <p>
            The invite comes to email specified when you registered on GitHub (you can find it here{' '}
            <a href="https://github.com/settings/emails">https://github.com/settings/emails</a>)
          </p>
          <p>
            <b>Your next steps are:</b>
            <ul>
              <li>Go to your email box</li>
              <li>
                Find the <b>invitation email</b> from Github
              </li>
              <li>Accept invitation</li>
            </ul>
          </p>
        </div>
      ),
    });
  };

  const handleSubmit = withLoading(async () => {
    await onSendInviteRepository(githubId);
    updateUrl();
    showInformation();
  });

  return (
    <Spin spinning={loading}>
      <CommonCard
        title="Your repository"
        icon={<GithubFilled />}
        content={
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', alignItems: 'center' }}>
            <Row>
              <Col style={{ marginBottom: 7, textAlign: 'center' }}>
                {url ? (
                  <div style={{ marginBottom: 7 }}>
                    <Text strong>{'Your repository:'}</Text>
                    <Paragraph style={{ textAlign: 'center', marginBottom: 10 }}>
                      <a target="_blank" href={url} style={{ fontSize: 16 }}>
                        <GithubFilled /> {nameGithubRepository}
                      </a>
                    </Paragraph>
                  </div>
                ) : (
                  <div style={{ marginBottom: 7 }}>
                    <Text style={{ color: '#ff5500' }} strong>
                      {`Your repository hasn't been created yet`}
                    </Text>
                  </div>
                )}
                <Button style={{ marginBottom: 7 }} type="primary" onClick={handleSubmit}>
                  {url ? 'Fix repository' : 'Create repository'}
                </Button>
              </Col>
            </Row>
          </div>
        }
      />
    </Spin>
  );
}

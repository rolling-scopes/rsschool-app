import { GithubFilled, WarningTwoTone } from '@ant-design/icons';
import { Button, Col, Modal, Row, Spin, theme, Typography } from 'antd';
import { useLoading } from 'components/useLoading';
import CommonCard from './CommonDashboardCard';

type Props = {
  url?: string;
  githubId: string;
  onSendInviteRepository: (githubId: string) => Promise<void>;
  onUpdateUrl: () => void;
};

const getGithubRepoName = (url: string | null | undefined) => (url ? (url.split('/').pop() ?? '') : '');

export function RepositoryCard(props: Props) {
  const { Text, Paragraph } = Typography;
  const { url, githubId, onSendInviteRepository, onUpdateUrl } = props;
  const repoName = getGithubRepoName(url);
  const hasRepo = !!url;
  const [loading, withLoading] = useLoading(false);
  const [modal, contextHolder] = Modal.useModal();
  const { token } = theme.useToken();

  const showInformation = () => {
    modal.info({
      okText: 'Got it',
      icon: <WarningTwoTone twoToneColor={token.colorWarning} />,
      title: <h3 style={{ color: token.colorWarning }}>Important</h3>,
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
    const shouldShowInformation = !hasRepo;
    if (shouldShowInformation) {
      showInformation();
    }
    onUpdateUrl();
  });

  return (
    <Spin spinning={loading}>
      {contextHolder}
      <CommonCard
        title="Your repository"
        content={
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', alignItems: 'center' }}>
            <Row>
              <Col style={{ marginBottom: 7, textAlign: 'center' }}>
                {url ? (
                  <div style={{ marginBottom: 7 }}>
                    <Text strong>{'Your repository:'}</Text>
                    <Paragraph style={{ textAlign: 'center', marginBottom: 10 }}>
                      <a target="_blank" href={url} style={{ fontSize: 16 }}>
                        <GithubFilled /> {repoName}
                      </a>
                    </Paragraph>
                  </div>
                ) : (
                  <div style={{ marginBottom: 7 }}>
                    <Text style={{ color: token.colorWarning }} strong>
                      {`Your repository hasn't been created yet`}
                    </Text>
                  </div>
                )}
                <Button style={{ marginBottom: 7 }} type={url ? 'default' : 'primary'} onClick={handleSubmit}>
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

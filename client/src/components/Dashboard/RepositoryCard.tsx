import * as React from 'react';
import { Typography, Row, Col, Button, message, Modal } from 'antd';
import CommonCard from './CommonDashboardCard';
import { GithubFilled, WarningOutlined } from '@ant-design/icons';

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

  const showInformation = () => {
    Modal.info({
      icon: <WarningOutlined style={{ color: 'red', fontWeight: 700, fontSize: 24 }} />,
      title: <h3 style={{ color: 'red', fontWeight: 800 }}>ATTENTION</h3>,
      content: (
        <div style={{ fontSize: 16, fontWeight: 700 }}>
          <p>
            GitHub will automatically send you an invite to access the repository. The invite comes to the mail you
            specified when registering on GitHub (<span style={{ color: 'red', fontWeight: 700 }}>ATTENTION:</span> not
            to the mail you specified in the RS APP)
          </p>
          <p style={{ fontSize: 18, fontWeight: 800, color: 'red' }}>
            After creating a private school repository, you must go to your mail, find an invitation EMAIL and accept
            it!
          </p>
        </div>
      ),
    });
  };

  const handleSubmit = async () => {
    try {
      await onSendInviteRepository(githubId);
      updateUrl();
      message.success('Your request has been submitted.');
      showInformation();
    } catch (e) {
      message.error('An error occurred. Please try later.');
    }
  };
  return (
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
                {url ? 'Fix repo' : 'Create repo'}
              </Button>
            </Col>
          </Row>
        </div>
      }
    />
  );
}

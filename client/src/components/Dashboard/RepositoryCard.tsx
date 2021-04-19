import * as React from 'react';
import { Typography, Row, Col, Button, message } from 'antd';
import CommonCard from './CommonDashboardCard';
import { GithubFilled } from '@ant-design/icons';

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

  const handleSubmit = async () => {
    try {
      await onSendInviteRepository(githubId);
      updateUrl();
      message.success('Your request has been submitted.');
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

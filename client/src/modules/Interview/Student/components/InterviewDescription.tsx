import { Descriptions } from 'antd';
import { InterviewDetails, getInterviewResult } from 'domain/interview';
import { GithubUserLink } from '@client/shared/components/GithubUserLink';
import { Decision } from 'data/interviews/technical-screening';
import { StatusLabel } from './StatusLabel';

export const InterviewDescription = ({ interviewer, status, result }: InterviewDetails) => {
  return (
    <div style={{ padding: '8px 0' }}>
      <Descriptions layout="vertical" size="small">
        <Descriptions.Item label="Interviewer">
          <GithubUserLink value={interviewer.githubId} />
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <StatusLabel status={status} />
        </Descriptions.Item>
        <Descriptions.Item label="Result">
          <b>{getInterviewResult(result as Decision) ?? '-'}</b>
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

import { Flex, Space, theme, Typography } from 'antd';
import { GithubAvatar } from '@client/components/GithubAvatar';

const { Text } = Typography;

export function InterviewerWidget({
  interviewer,
  vertical,
}: {
  interviewer: { name: string; githubId: string };
  vertical?: boolean;
}) {
  const { token } = theme.useToken();

  return (
    <a href={`/profile?githubId=${interviewer.githubId}`}>
      <Flex gap="0.2em" vertical={vertical}>
        <Text
          style={{
            color: vertical ? token.colorTextTertiary : token.colorTextBase,
            fontSize: '1em',
            fontWeight: vertical ? 'normal' : 'bold',
            marginInlineEnd: '0.5ch',
          }}
        >
          Interviewer {vertical ? '' : ':'}
        </Text>
        <Space style={{ flexDirection: vertical ? 'row' : 'row-reverse' }}>
          <GithubAvatar size={24} githubId={interviewer.githubId} />
          <Text>{interviewer.name}</Text>
        </Space>
      </Flex>
    </a>
  );
}

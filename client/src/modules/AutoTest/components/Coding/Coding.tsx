import { Space, Typography } from 'antd';
import { CourseTaskDetailedDtoTypeEnum } from 'api';
import CopyToClipboardButton from 'components/CopyToClipboardButton';
import { CourseTaskVerifications } from 'modules/AutoTest/types';
import { useAsync } from 'react-use';
import { useState } from 'react';

export type CodingProps = {
  courseTask: CourseTaskVerifications;
  githubId: string;
};

const { Paragraph, Text, Link } = Typography;

async function getCodewarsUsername(githubId: string) {
  const digest = await window.crypto.subtle.digest('sha-1', new TextEncoder().encode(githubId));
  const bytes = [...new Uint8Array(digest)];
  const hash = bytes.map(x => x.toString(16).padStart(2, '0')).join('').substring(0, 12);
  return `rsschool_${hash}`;
}

function Coding({ courseTask, githubId }: CodingProps) {
  const repoUrl = `https://github.com/${githubId}/${courseTask?.githubRepoName}`;
  const codewarsLink = 'https://www.codewars.com/users/edit';
  const [codewarsUsername, setCodewarsUsername] = useState<string | null>(null);

  useAsync(async () => {
    setCodewarsUsername(await getCodewarsUsername(githubId));
  }, []);

  if (courseTask.type === CourseTaskDetailedDtoTypeEnum.Codewars) {
    return (
      <>
        <Paragraph>
          Please use the next username in your{' '}
          <Link href={codewarsLink} target="_blank">
            codewars profile
          </Link>
          :
        </Paragraph>
        <Paragraph>
          {codewarsUsername ? (
            <Space>
              <Text strong>{codewarsUsername}</Text>
              <CopyToClipboardButton value={codewarsUsername} />
            </Space>
          ) : null}
        </Paragraph>
      </>
    );
  }

  return (
    <>
      {courseTask.type === CourseTaskDetailedDtoTypeEnum.Jstask && (
        <Paragraph type="warning" strong>
          Tests run on Node.js version 16. Please make sure your solution works on Node.js version 16.
        </Paragraph>
      )}
      <Paragraph>
        The system will run tests in the following repository and will update the score based on the result:
      </Paragraph>
      <Paragraph>
        <a href={repoUrl} target="_blank">
          {repoUrl}
        </a>
      </Paragraph>
    </>
  );
}

export default Coding;

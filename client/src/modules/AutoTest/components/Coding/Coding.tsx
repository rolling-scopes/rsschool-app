import crypto from 'crypto';
import { Space, Typography } from 'antd';
import { CourseTaskDetailedDtoTypeEnum } from 'api';
import CopyToClipboardButton from 'components/CopyToClipboardButton';
import { CourseTaskVerifications } from 'modules/AutoTest/types';

export type CodingProps = {
  courseTask: CourseTaskVerifications;
  githubId: string;
};

const { Paragraph, Text, Link } = Typography;

function getCodewarsUsername(githubId: string) {
  const hash = crypto.createHash('sha1').update(githubId).digest('hex');
  return `rsschool_${hash.slice(0, 16)}`;
}

function Coding({ courseTask, githubId }: CodingProps) {
  const repoUrl = `https://github.com/${githubId}/${courseTask?.githubRepoName}`;
  const codewarsLink = 'https://www.codewars.com/users/edit';
  const codewarsUsername = getCodewarsUsername(githubId);

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
          <Space>
            <Text strong>{codewarsUsername}</Text>
            <CopyToClipboardButton value={codewarsUsername} />
          </Space>
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

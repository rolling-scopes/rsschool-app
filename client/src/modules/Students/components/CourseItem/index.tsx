import { Flex, List, Space, Typography } from 'antd';
import { SafetyCertificateTwoTone } from '@ant-design/icons';
import { UserStudentCourseDto } from 'api';

const { Text, Paragraph, Link } = Typography;

type Props = {
  course: UserStudentCourseDto;
};

export const CourseItem = ({ course }: Props) => {
  const { name, certificateId, mentorGithubId, mentorFullName, rank, totalScore } = course;

  return (
    <List.Item>
      <Flex vertical gap={4}>
        <Text strong>{name}</Text>
        {certificateId && (
          <Paragraph>
            <SafetyCertificateTwoTone twoToneColor="#52c41a" />{' '}
            <Link target="__blank" href={`/certificate/${certificateId}`}>
              Certificate
            </Link>
          </Paragraph>
        )}
        {mentorGithubId && (
          <Paragraph>
            Mentor: <Link href={`/profile?githubId=${mentorGithubId}`}>{mentorFullName}</Link>
          </Paragraph>
        )}
        <Space wrap>
          {rank && <Paragraph>Position: {rank}</Paragraph>}
          <Paragraph>Score: {totalScore}</Paragraph>
        </Space>
      </Flex>
    </List.Item>
  );
};

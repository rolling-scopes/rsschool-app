import { Badge, Button, Card, Divider, Flex, List, Space, Typography } from 'antd';
import { HeartOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { TopMentorDto } from 'api';
import { GithubAvatar } from 'components/GithubAvatar';
import styles from './MentorCard.module.css';

const { Title, Link: AntLink, Text } = Typography;

interface MentorCardProps {
  mentor: TopMentorDto;
}

function getRankBadgeColor(rank: number): string {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return '#cd7f32';
  return 'purple';
}

export function MentorCard({ mentor }: MentorCardProps) {
  const { rank, githubId, name, totalStudents, totalGratitudes, courseStats } = mentor;

  const gratitudeUrl = `/gratitude?githubId=${githubId}`;

  return (
    <Card
      hoverable
      className={styles.card}
      actions={[
        <Link href={gratitudeUrl} passHref legacyBehavior key="thank">
          <Button type="text" icon={<HeartOutlined />}>
            Say Thank you!
          </Button>
        </Link>,
      ]}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Flex align="center" gap="middle">
          <Badge count={rank} color={getRankBadgeColor(rank)} className={styles.rankBadge} />
          <GithubAvatar githubId={githubId} size={48} />
          <Space direction="vertical" size={0} style={{ flex: 1, minWidth: 0 }}>
            <Title level={5} style={{ margin: 0 }}>
              {name}
            </Title>
            <AntLink href={`https://github.com/${githubId}`} target="_blank" rel="noopener noreferrer">
              @{githubId}
            </AntLink>
          </Space>
        </Flex>

        <Card size="small" className={styles.totalStudentsCard}>
          <Flex justify="space-between" align="center" gap="small" wrap="nowrap">
            <Text strong style={{ fontSize: '1.5rem', flexShrink: 0 }}>
              {totalStudents}
            </Text>
            <Text type="secondary" className={styles.certifiedText}>
              certified students
            </Text>
            <Flex align="center" gap={4} style={{ flexShrink: 0 }}>
              <Text strong style={{ fontSize: '1.5rem' }}>
                {totalGratitudes}
              </Text>
              <Text style={{ fontSize: '1.25rem' }}>❤️</Text>
            </Flex>
          </Flex>
        </Card>

        {courseStats.length > 0 && (
          <>
            <Divider style={{ margin: 0 }} />
            <List
              size="small"
              dataSource={courseStats}
              renderItem={stat => (
                <List.Item>
                  <Flex justify="space-between" style={{ width: '100%' }}>
                    <Text style={{ flex: 1 }}>{stat.courseName}</Text>
                    <Text strong>{stat.studentsCount}</Text>
                  </Flex>
                </List.Item>
              )}
              className={styles.courseList}
            />
          </>
        )}
      </Space>
    </Card>
  );
}

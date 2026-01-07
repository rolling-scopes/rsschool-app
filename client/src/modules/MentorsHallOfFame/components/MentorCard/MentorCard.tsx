import { Avatar, Badge, Button, Card, Divider, Flex, List, Space, Typography } from 'antd';
import { HeartOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { GithubAvatar } from 'components/GithubAvatar';
import { TopMentor } from '../../types';
import styles from './MentorCard.module.css';

const { Title, Link: AntLink, Text } = Typography;

interface MentorCardProps {
  mentor: TopMentor;
}

function getRankBadgeColor(rank: number): string {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return '#cd7f32';
  return 'purple';
}

export function MentorCard({ mentor }: MentorCardProps) {
  const { rank, githubId, name, totalStudents, courseStats } = mentor;

  return (
    <Card hoverable className={styles.card}>
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

        <div className={styles.totalStudents}>
          <Text strong style={{ fontSize: '1.25rem' }}>
            {totalStudents}
          </Text>{' '}
          <Text type="secondary">certified students</Text>
        </div>

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

        <Link href="/gratitude" passHref legacyBehavior>
          <Button type="primary" icon={<HeartOutlined />} block>
            Say Thank you!
          </Button>
        </Link>
      </Space>
    </Card>
  );
}

import { Button, Card, Typography } from 'antd';
import { HeartOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { GithubAvatar } from 'components/GithubAvatar';
import { TopMentor } from '../../types';
import styles from './MentorCard.module.css';

const { Text } = Typography;

interface MentorCardProps {
  mentor: TopMentor;
}

function getRankClass(rank: number): string {
  if (rank === 1) return styles.gold ?? '';
  if (rank === 2) return styles.silver ?? '';
  if (rank === 3) return styles.bronze ?? '';
  return '';
}

export function MentorCard({ mentor }: MentorCardProps) {
  const { rank, githubId, name, totalStudents, courseStats } = mentor;

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={`${styles.rank} ${getRankClass(rank)}`}>{rank}</div>
        <GithubAvatar githubId={githubId} size={48} />
        <div className={styles.mentorInfo}>
          <h3 className={styles.mentorName}>{name}</h3>
          <a
            href={`https://github.com/${githubId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.githubLink}
          >
            @{githubId}
          </a>
        </div>
      </div>

      <div className={styles.totalStudents}>
        <Text strong>{totalStudents}</Text> certified students
      </div>

      {courseStats.length > 0 && (
        <div className={styles.courseStatsList}>
          {courseStats.map(stat => (
            <div key={stat.courseName} className={styles.courseStatsItem}>
              <span className={styles.courseName}>{stat.courseName}</span>
              <span className={styles.studentsCount}>{stat.studentsCount}</span>
            </div>
          ))}
        </div>
      )}

      <Link href="/gratitude" passHref legacyBehavior>
        <Button type="primary" icon={<HeartOutlined />} className={styles.thankButton}>
          Say Thank you!
        </Button>
      </Link>
    </Card>
  );
}

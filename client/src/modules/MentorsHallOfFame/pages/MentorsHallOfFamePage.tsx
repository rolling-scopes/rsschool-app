import { useCallback, useEffect, useState } from 'react';
import { Col, Empty, Row, Spin, Typography } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { MentorCard } from '../components/MentorCard/MentorCard';
import { MentorsHallOfFameService } from '../services/mentors-hall-of-fame.service';
import { TopMentor } from '../types';

const { Title, Paragraph } = Typography;

const service = new MentorsHallOfFameService();

export function MentorsHallOfFamePage() {
  const [mentors, setMentors] = useState<TopMentor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    try {
      const data: TopMentor[] = await service.getTopMentors();
      setMentors(data);
    } catch (error) {
      console.error('Failed to fetch top mentors:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <TrophyOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
        <Title level={1}>Mentors Hall of Fame</Title>
        <Paragraph type="secondary" style={{ fontSize: 16 }}>
          Celebrating our top 10 mentors who guided the most students to receive certificates in the last year
        </Paragraph>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : mentors.length === 0 ? (
        <Empty description="No mentors found" />
      ) : (
        <Row gutter={[24, 24]}>
          {mentors.map(mentor => (
            <Col key={mentor.githubId} xs={24} sm={12} lg={8} xl={6}>
              <MentorCard mentor={mentor} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

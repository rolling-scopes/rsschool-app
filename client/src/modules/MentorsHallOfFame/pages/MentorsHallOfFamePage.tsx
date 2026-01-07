import { useCallback, useEffect, useState } from 'react';
import { Col, Empty, Flex, Row, Space, Spin, Typography } from 'antd';
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
    <Flex justify="center" style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: 1200 }}>
        <Flex vertical align="center" gap="middle">
          <TrophyOutlined style={{ fontSize: 48, color: '#faad14' }} />
          <Title level={1} style={{ margin: 0 }}>
            Mentors Hall of Fame
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 16, margin: 0, textAlign: 'center' }}>
            Celebrating our top 10 mentors who guided the most students to receive certificates in the last year
          </Paragraph>
        </Flex>

        {loading ? (
          <Flex vertical align="center" gap="middle" style={{ padding: 48 }}>
            <Spin size="large" />
            <Paragraph type="secondary">Loading top mentors...</Paragraph>
          </Flex>
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
      </Space>
    </Flex>
  );
}

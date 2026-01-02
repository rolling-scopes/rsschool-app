import { useCallback, useEffect, useState } from 'react';
import { Col, Empty, Pagination, Row, Spin, Typography } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { MentorCard } from '../components/MentorCard/MentorCard';
import { MentorsHallOfFameService } from '../services/mentors-hall-of-fame.service';
import { PaginatedTopMentors, TopMentor, Pagination as PaginationType } from '../types';

const { Title, Paragraph } = Typography;

const PAGE_SIZE = 20;

const service = new MentorsHallOfFameService();

export function MentorsHallOfFamePage() {
  const [mentors, setMentors] = useState<TopMentor[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    pageSize: PAGE_SIZE,
    current: 1,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchMentors = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const data: PaginatedTopMentors = await service.getTopMentors(page, PAGE_SIZE);
      setMentors(data.items);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch top mentors:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMentors(1);
  }, [fetchMentors]);

  const handlePageChange = (page: number) => {
    fetchMentors(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <TrophyOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
        <Title level={1}>Mentors Hall of Fame</Title>
        <Paragraph type="secondary" style={{ fontSize: 16 }}>
          Celebrating our top mentors who guided the most students to receive certificates in the last year
        </Paragraph>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : mentors.length === 0 ? (
        <Empty description="No mentors found" />
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {mentors.map(mentor => (
              <Col key={mentor.githubId} xs={24} sm={12} lg={8} xl={6}>
                <MentorCard mentor={mentor} />
              </Col>
            ))}
          </Row>

          {pagination.totalPages > 1 && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

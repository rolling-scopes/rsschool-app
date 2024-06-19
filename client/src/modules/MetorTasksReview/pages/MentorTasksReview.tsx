import { Space, TablePaginationConfig, Typography, message } from 'antd';
import { MentorReviewDto, MentorReviewsApi } from 'api';
import { IPaginationInfo } from 'common/types/pagination';
import { AdminPageLayout } from 'components/PageLayout';
import { useLoading } from 'components/useLoading';
import { useActiveCourseContext } from 'modules/Course/contexts';
import { useState } from 'react';
import { useAsync } from 'react-use';
import MentorReviewsTable from '../components/ReviewsTable';

const { Text } = Typography;

const mentorReviewsApi = new MentorReviewsApi();

type ReviewsState = {
  content: MentorReviewDto[];
  pagination: IPaginationInfo;
};

export const MentorTasksReview = () => {
  const { courses, course } = useActiveCourseContext();

  const [reviews, setReviews] = useState<ReviewsState>({
    content: [],
    pagination: { current: 1, pageSize: 20 },
  });
  const [loading, withLoading] = useLoading(false);

  const getMentorReviews = withLoading(async (pagination: TablePaginationConfig) => {
    try {
      const { data } = await mentorReviewsApi.getMentorReviews(
        String(pagination.current),
        String(pagination.pageSize),
        course.id,
      );
      setReviews({ ...reviews, ...data });
    } catch (error) {
      message.error('Failed to load mentor reviews. Please try later.');
    }
  });

  useAsync(async () => await getMentorReviews(reviews.pagination), [course]);

  return (
    <AdminPageLayout loading={loading} title="Mentor tasks review" showCourseName courses={courses}>
      <Space direction="vertical">
        <Space>
          <Text strong>Submitted tasks</Text>
          <Text>{course.name}</Text>
        </Space>
        <Text type="secondary">You can assign a checker for the student’s task</Text>
      </Space>
      <MentorReviewsTable content={reviews.content} pagination={reviews.pagination} handleChange={getMentorReviews} />
    </AdminPageLayout>
  );
};

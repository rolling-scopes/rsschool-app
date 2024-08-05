import { Space, TablePaginationConfig, Typography, message } from 'antd';
import { MentorReviewDto, MentorReviewsApi } from 'api';
import { IPaginationInfo } from 'common/types/pagination';
import { AdminPageLayout } from 'components/PageLayout';
import { useLoading } from 'components/useLoading';
import { useActiveCourseContext } from 'modules/Course/contexts';
import { useState } from 'react';
import { useAsync } from 'react-use';
import type { PageProps } from './getServerSideProps';
import MentorReviewsTable from '../components/ReviewsTable';
import { FilterValue } from 'antd/es/table/interface';
import { ColumnKey } from '../components/ReviewsTable/renderers';
import { SorterResult } from 'antd/lib/table/interface';
import { sortDirectionMap } from './MentorTasksReview.constants';

const { Text } = Typography;

const mentorReviewsApi = new MentorReviewsApi();

type ReviewsState = {
  content: MentorReviewDto[];
  pagination: IPaginationInfo;
};

export const MentorTasksReview = ({ tasks }: PageProps) => {
  const { courses, course } = useActiveCourseContext();

  const [reviews, setReviews] = useState<ReviewsState>({
    content: [],
    pagination: { current: 1, pageSize: 20 },
  });
  const [loading, withLoading] = useLoading(false);

  const getMentorReviews = withLoading(
    async (
      pagination: TablePaginationConfig,
      filters?: Record<ColumnKey, FilterValue | null>,
      sorter?: SorterResult<MentorReviewDto> | SorterResult<MentorReviewDto>[],
    ) => {
      const sortValues =
        sorter && !Array.isArray(sorter) && sorter.order
          ? [sorter.field?.toString(), sortDirectionMap[sorter.order]]
          : [undefined, undefined];

      try {
        const { data } = await mentorReviewsApi.getMentorReviews(
          String(pagination.current),
          String(pagination.pageSize),
          course.id,
          filters?.taskName?.toString(),
          filters?.student?.toString(),
          ...sortValues,
        );
        setReviews({ ...reviews, ...data });
      } catch (error) {
        message.error('Failed to load mentor reviews. Please try later.');
      }
    },
  );

  const handleReviewerAssigned = async () => {
    await getMentorReviews(reviews.pagination);
  };

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
      <MentorReviewsTable
        content={reviews.content}
        pagination={reviews.pagination}
        handleChange={getMentorReviews}
        handleReviewerAssigned={handleReviewerAssigned}
        tasks={tasks}
      />
    </AdminPageLayout>
  );
};

import { useRequest } from 'ahooks';
import { message, Space, TablePaginationConfig, Typography } from 'antd';
import { FilterValue } from 'antd/es/table/interface';
import { SorterResult } from 'antd/lib/table/interface';
import { CoursesTasksApi, CourseTaskDtoCheckerEnum, MentorReviewDto, MentorReviewsApi } from 'api';
import { IPaginationInfo } from 'common/types/pagination';
import { AdminPageLayout } from 'components/PageLayout';
import { useLoading } from 'components/useLoading';
import { isCourseManager } from 'domain/user';
import { SessionContext, useActiveCourseContext } from 'modules/Course/contexts';
import { useContext, useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import MentorReviewsTable from '../components/ReviewsTable';
import { ColumnKey } from '../components/ReviewsTable/renderers';
import { sortDirectionMap } from './MentorTasksReview.constants';

const { Text } = Typography;

const mentorReviewsApi = new MentorReviewsApi();
const coursesTasksApi = new CoursesTasksApi();

type ReviewsState = {
  content: MentorReviewDto[];
  pagination: IPaginationInfo;
};

export const MentorTasksReview = () => {
  const { courses, course } = useActiveCourseContext();
  const session = useContext(SessionContext);

  const { data: tasks } = useRequest(async () => {
    const { data } = await coursesTasksApi.getCourseTasks(course.id, undefined, CourseTaskDtoCheckerEnum.Mentor);
    return data;
  });

  const isManager = useMemo(() => isCourseManager(session, course.id), [session, course.id]);

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
      } catch {
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
        {isManager && <Text type="secondary">You can assign a checker for the student’s task</Text>}
      </Space>
      <MentorReviewsTable
        content={reviews.content}
        pagination={reviews.pagination}
        handleChange={getMentorReviews}
        handleReviewerAssigned={handleReviewerAssigned}
        tasks={tasks ?? []}
        isManager={isManager}
      />
    </AdminPageLayout>
  );
};

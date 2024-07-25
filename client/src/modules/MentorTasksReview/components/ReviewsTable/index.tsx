import { Table, TablePaginationConfig, TableProps } from 'antd';
import { CourseTaskDto, MentorReviewDto } from 'api';
import { getColumns } from './renderers';
import AssignReviewerModal from '../AssignReviewerModal';
import { useState } from 'react';

type Props = {
  content: MentorReviewDto[];
  pagination: false | TablePaginationConfig;
  handleChange?: TableProps<MentorReviewDto>['onChange'];
  loading?: boolean;
  tasks: CourseTaskDto[];
};

export default function MentorReviewsTable({ content, pagination, handleChange, loading, tasks }: Props) {
  const [modalData, setModalData] = useState<MentorReviewDto | null>(null);

  const handleAssignReviewer = (review: MentorReviewDto) => setModalData(review);

  return (
    <>
      <Table<MentorReviewDto>
        showHeader
        dataSource={content}
        size="small"
        columns={getColumns(tasks, handleAssignReviewer)}
        onChange={handleChange}
        rowKey="id"
        pagination={pagination}
        loading={loading}
      />
      <AssignReviewerModal review={modalData} onClose={setModalData}  />
    </>
  );
}

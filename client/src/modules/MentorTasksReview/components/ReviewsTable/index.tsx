import { Table, TablePaginationConfig, TableProps } from 'antd';
import { CourseTaskDto, MentorReviewDto } from '@client/api';
import { getColumns } from './renderers';
import AssignReviewerModal from '../AssignReviewerModal';
import { useState } from 'react';

type Props = {
  content: MentorReviewDto[];
  pagination: false | TablePaginationConfig;
  handleChange?: TableProps<MentorReviewDto>['onChange'];
  handleReviewerAssigned: () => void;
  loading?: boolean;
  tasks: CourseTaskDto[];
  isManager: boolean;
};

export default function MentorReviewsTable({
  content,
  pagination,
  handleChange,
  handleReviewerAssigned,
  loading,
  tasks,
  isManager,
}: Props) {
  const [modalData, setModalData] = useState<MentorReviewDto | null>(null);

  const handleClick = (review: MentorReviewDto) => setModalData(review);
  const handleClose = () => setModalData(null);

  return (
    <>
      <Table<MentorReviewDto>
        showHeader
        dataSource={content}
        size="small"
        columns={getColumns(tasks, handleClick, isManager)}
        onChange={handleChange}
        rowKey="id"
        pagination={pagination}
        loading={loading}
      />
      <AssignReviewerModal review={modalData} onClose={handleClose} onSubmit={handleReviewerAssigned} />
    </>
  );
}

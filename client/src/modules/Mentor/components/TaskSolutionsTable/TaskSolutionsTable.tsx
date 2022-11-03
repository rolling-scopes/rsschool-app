import { Col, Row, Table } from 'antd';
import React, { useState } from 'react';
import { getColumns } from '.';
import { MentorDashboardDto, ProfileCourseDto } from 'api';
import { useMentorDashboard } from 'modules/Mentor/hooks/useMentorDashboard';
import { SubmitReviewModal } from 'modules/Mentor/components/SubmitReviewModal';

export interface TaskSolutionsTableProps {
  mentorId: number | null;
  course: ProfileCourseDto;
}

const getUniqueKey = (record: MentorDashboardDto) => Object.values(record).filter(Boolean).join('|');

function TaskSolutionsTable({ mentorId, course }: TaskSolutionsTableProps) {
  const [modalData, setModalData] = useState<MentorDashboardDto | null>(null);
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);
  const [data, loading] = useMentorDashboard(mentorId, course.id, isReviewSubmitted);

  const handleSubmit = () => {
    setModalData(null);
    setIsReviewSubmitted(!isReviewSubmitted);
  };

  const handleSubmitClick = (data: MentorDashboardDto) => {
    setModalData(data);
  };

  const handleClose = () => {
    setModalData(null);
  };

  return (
    <>
      <Row>
        <Col span={24}>
          <Table
            locale={{
              // disable default tooltips on sortable columns
              triggerDesc: undefined,
              triggerAsc: undefined,
              cancelSort: undefined,
            }}
            pagination={false}
            columns={getColumns(handleSubmitClick)}
            dataSource={data}
            size="middle"
            rowKey={getUniqueKey}
            loading={loading}
          />
        </Col>
      </Row>
      <SubmitReviewModal courseId={course.id} data={modalData} onClose={handleClose} onSubmit={handleSubmit} />
    </>
  );
}

export default TaskSolutionsTable;

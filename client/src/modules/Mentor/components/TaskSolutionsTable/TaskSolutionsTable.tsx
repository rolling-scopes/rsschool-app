import { Col, Row, Table } from 'antd';
import React, { useState } from 'react';
import { getColumns } from '.';
import { MentorDashboardDto } from 'api';
import { useMentorDashboard } from 'modules/Mentor/hooks/useMentorDashboard';
import { SubmitReviewModal } from 'modules/Mentor/components/SubmitReviewModal';

export interface TaskSolutionsTableProps {
  mentorId: number | null;
  courseId: number;
}

const getUniqueKey = (record: MentorDashboardDto) => Object.values(record).filter(Boolean).join('|');

function TaskSolutionsTable({ mentorId, courseId }: TaskSolutionsTableProps) {
  const [modalData, setModalData] = useState<MentorDashboardDto | null>(null);
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);
  const [data, loading] = useMentorDashboard(mentorId, courseId, isReviewSubmitted);

  const handleDataSubmit = () => {
    setIsReviewSubmitted(!isReviewSubmitted);
  };

  const handleSubmitButtonClick = (data: MentorDashboardDto) => {
    setModalData(data);
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
            columns={getColumns(handleSubmitButtonClick)}
            dataSource={data}
            size="middle"
            rowKey={getUniqueKey}
            loading={loading}
          />
        </Col>
      </Row>
      <SubmitReviewModal courseId={courseId} data={modalData} onClose={setModalData} onSubmit={handleDataSubmit} />
    </>
  );
}

export default TaskSolutionsTable;

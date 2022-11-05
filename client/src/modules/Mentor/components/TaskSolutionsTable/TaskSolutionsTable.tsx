import { Col, Row, Table } from 'antd';
import React, { useMemo, useState } from 'react';
import { getColumns } from '.';
import { MentorDashboardDto } from 'api';
import { useMentorDashboard } from 'modules/Mentor/hooks/useMentorDashboard';
import { SubmitReviewModal } from 'modules/Mentor/components/SubmitReviewModal';
import { TaskStatusTabs } from '../TaskStatusTabs';
import { StudentTaskSolutionItemStatus } from '../../constants';

export interface TaskSolutionsTableProps {
  mentorId: number | null;
  courseId: number;
}

const getUniqueKey = (record: MentorDashboardDto) => Object.values(record).filter(Boolean).join('|');

function TaskSolutionsTable({ mentorId, courseId }: TaskSolutionsTableProps) {
  const [modalData, setModalData] = useState<MentorDashboardDto | null>(null);
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>();

  const [data, loading] = useMentorDashboard(mentorId, courseId, isReviewSubmitted);

  const statuses = useMemo(() => data?.map(({ status }) => status as StudentTaskSolutionItemStatus), [data]);

  const handleDataSubmit = () => {
    setIsReviewSubmitted(!isReviewSubmitted);
  };

  const handleSubmitButtonClick = (data: MentorDashboardDto) => {
    setModalData(data);
  };

  return (
    <>
      <Row style={{ background: 'white' }}>
        <Col span={24}>
          <TaskStatusTabs statuses={statuses} onTabChange={setActiveTab} activeTab={activeTab} />
        </Col>
      </Row>
      <Row style={{ padding: '0 24px', background: 'white'}}>
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

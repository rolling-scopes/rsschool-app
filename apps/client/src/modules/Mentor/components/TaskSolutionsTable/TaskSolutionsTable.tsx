import { Col, Row, Table } from 'antd';
import React, { useMemo, useState } from 'react';
import { getColumns } from '.';
import { MentorDashboardDto } from 'api';
import { useMentorDashboard } from 'modules/Mentor/hooks/useMentorDashboard';
import { SubmitReviewModal } from 'modules/Mentor/components/SubmitReviewModal';
import { TaskStatusTabs } from '../TaskStatusTabs';
import { SolutionItemStatus } from '../../constants';
import { ReviewRandomTask } from '../ReviewRandomTask';

export interface TaskSolutionsTableProps {
  mentorId: number;
  courseId: number;
}

const getUniqueKey = (record: MentorDashboardDto) => Object.values(record).filter(Boolean).join('|');

function TaskSolutionsTable({ mentorId, courseId }: TaskSolutionsTableProps) {
  const [modalData, setModalData] = useState<MentorDashboardDto | null>(null);
  const [reloadData, setReloadData] = useState(false);
  const [activeTab, setActiveTab] = useState(SolutionItemStatus.InReview);

  const [data, loading] = useMentorDashboard(mentorId, courseId, reloadData);

  const statuses = useMemo(() => data?.map(({ status }) => status as SolutionItemStatus), [data]);
  const isReviewRandomTaskVisible = useMemo(() => {
    const hasRandomTask = data && data?.filter(({ status }) => status === SolutionItemStatus.RandomTask)?.length > 0;
    return activeTab === SolutionItemStatus.RandomTask && !hasRandomTask;
  }, [data, activeTab]);

  const filteredData = data?.filter(item => item.status === activeTab);

  const handleReloadData = () => {
    setReloadData(!reloadData);
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
      <Row style={{ padding: '0 24px', background: 'white' }}>
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
            dataSource={filteredData}
            size="middle"
            rowKey={getUniqueKey}
            loading={loading}
          />
        </Col>
      </Row>
      {isReviewRandomTaskVisible && (
        <Row style={{ background: 'white', padding: '24px 0' }} justify="center">
          <Col>
            <ReviewRandomTask mentorId={mentorId} courseId={courseId} onClick={handleReloadData} />
          </Col>
        </Row>
      )}
      <SubmitReviewModal courseId={courseId} data={modalData} onClose={setModalData} onSubmit={handleReloadData} />
    </>
  );
}

export default TaskSolutionsTable;

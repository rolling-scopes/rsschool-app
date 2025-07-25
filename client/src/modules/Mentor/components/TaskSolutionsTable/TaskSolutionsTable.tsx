import { Col, Row, Table } from 'antd';
import { MentorDashboardDto } from 'api';
import { useMemo, useState } from 'react';
import { getColumns } from './renderers';
import { SolutionItemStatus } from '../../constants';
import { ReviewRandomTask } from '../ReviewRandomTask';
import { SubmitReviewModal } from '../SubmitReviewModal';
import { TaskStatusTabs } from '../TaskStatusTabs';

export interface TaskSolutionsTableProps {
  mentorId: number;
  courseId: number;
  onChange: () => void;
  data: MentorDashboardDto[];
  loading: boolean;
}

const getUniqueKey = (record: MentorDashboardDto) => Object.values(record).filter(Boolean).join('|');

function TaskSolutionsTable({ mentorId, onChange, data, loading, courseId }: TaskSolutionsTableProps) {
  const [modalData, setModalData] = useState<MentorDashboardDto | null>(null);
  const [activeTab, setActiveTab] = useState(SolutionItemStatus.InReview);

  const statuses = useMemo(() => data?.map(({ status }) => status as SolutionItemStatus), [data]);
  const isReviewRandomTaskVisible = useMemo(() => {
    const hasRandomTask = data && data?.filter(({ status }) => status === SolutionItemStatus.RandomTask)?.length > 0;
    return activeTab === SolutionItemStatus.RandomTask && !hasRandomTask;
  }, [data, activeTab]);

  const filteredData = data?.filter(item => item.status === activeTab);

  const handleSubmitButtonClick = (data: MentorDashboardDto) => {
    setModalData(data);
  };

  return (
    <>
      <Row>
        <Col span={24}>
          <TaskStatusTabs statuses={statuses} onTabChange={setActiveTab} activeTab={activeTab} />
        </Col>
      </Row>
      <Row style={{ padding: '0 24px' }}>
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
        <Row style={{ padding: '24px 0' }} justify="center">
          <Col>
            <ReviewRandomTask mentorId={mentorId} courseId={courseId} onClick={onChange} />
          </Col>
        </Row>
      )}
      <SubmitReviewModal courseId={courseId} data={modalData} onClose={setModalData} onSubmit={onChange} />
    </>
  );
}

export default TaskSolutionsTable;

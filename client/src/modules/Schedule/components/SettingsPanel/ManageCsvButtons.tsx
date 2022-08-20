import { ExportOutlined } from '@ant-design/icons';
import { Button, Col, Row, Tooltip } from 'antd';
import React from 'react';

interface ManageCsvButtonsProps {
  courseId: number;
  timezone: string;
  refreshData: () => void;
}

const ManageCsvButtons: React.FC<ManageCsvButtonsProps> = ({ courseId, timezone }) => {
  const exportToCsvFile = () => {
    window.location.href = `/api/course/${courseId}/schedule/csv/${timezone.replace('/', '_')}`;
  };

  return (
    <Row justify="start" gutter={[16, 16]}>
      <Col>
        <Tooltip title="Export schedule" placement="topRight">
          <Button onClick={exportToCsvFile} icon={<ExportOutlined />} />
        </Tooltip>
      </Col>
    </Row>
  );
};

export default ManageCsvButtons;

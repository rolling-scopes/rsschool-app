import { FileExcelOutlined } from '@ant-design/icons';
import { Button } from 'antd';
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
    <Button onClick={exportToCsvFile} icon={<FileExcelOutlined />}>
      Export
    </Button>
  );
};

export default ManageCsvButtons;

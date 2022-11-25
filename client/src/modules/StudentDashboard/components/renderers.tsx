import { CourseScheduleItemDto } from 'api';
import { ColumnType } from 'antd/lib/table';
import { coloredDateRenderer, renderTask } from 'components/Table';
import { renderTagWithStyle } from 'modules/Schedule/components/TableView/renderers';
import { CalendarOutlined } from '@ant-design/icons';
import { Space, Typography } from 'antd';

enum ColumnKey {
  Name = 'name',
  Type = 'type',
  EndDate = 'end-date',
}

export function getAvailableTasksColumns(): ColumnType<CourseScheduleItemDto>[] {
  return [
    {
      key: ColumnKey.Name,
      dataIndex: 'name',
      render: renderTask,
    },
    {
      key: ColumnKey.Type,
      dataIndex: 'tag',
      align: 'center',
      render: (tag: CourseScheduleItemDto['tag']) => renderTagWithStyle(tag),
    },
    {
      key: ColumnKey.EndDate,
      dataIndex: 'endDate',
      align: 'right',
      render: renderEndDate,
    },
  ];
}

function renderEndDate(value: string, row: CourseScheduleItemDto) {
  if (!value && !row.endDate) return;

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const date = coloredDateRenderer(timeZone, 'MMM DD HH:mm', 'end', 'Recommended deadline')(value, row);

  return (
    <Space wrap style={{ justifyContent: 'end' }}>
      <Typography.Text type="secondary">
        <CalendarOutlined />
        &nbsp;Due to:
      </Typography.Text>
      {date}
    </Space>
  );
}

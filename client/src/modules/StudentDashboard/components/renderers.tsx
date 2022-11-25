import { Tag } from 'antd';
import moment from 'moment-timezone';
import { CourseScheduleItemDto } from 'api';
import { ColumnType } from 'antd/lib/table';

enum ColumnKey {
  Name = 'name',
  Type = 'type',
  EndDate = 'end-date',
}

function dateTimeTimeZoneRenderer(value: string | null) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return value ? moment(value).tz(timeZone).format('YYYY-MM-DD HH:mm') : '';
}

export function getAvailableEventsTableColumns(): ColumnType<CourseScheduleItemDto>[] {
  return [
    {
      key: ColumnKey.Name,
      dataIndex: 'name',
      render: (value: string, row: CourseScheduleItemDto) => {
        if (!row.descriptionUrl) return value;

        return (
          <a target="_blank" href={row.descriptionUrl}>
            {row.name}
          </a>
        );
      },
    },
    {
      key: ColumnKey.Type,
      dataIndex: 'tag',
      render: (value: string, row: CourseScheduleItemDto) => {
        if (!row.tag) return value;

        return <Tag>{row.tag}</Tag>;
      },
    },
    {
      key: ColumnKey.EndDate,
      dataIndex: 'endDate',
      align: 'right',
      // render: coloredDateRenderer(timezone, 'YYYY-MM-DD HH:mm', 'start', 'Recommended date for studying'),
      render: (_: string, row: CourseScheduleItemDto) => dateTimeTimeZoneRenderer(row.endDate),
    },
  ];
}

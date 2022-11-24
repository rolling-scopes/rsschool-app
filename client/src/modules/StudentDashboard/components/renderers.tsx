import { Tag } from 'antd';
import moment from 'moment-timezone';
import { CourseEvent } from 'services/course';

enum ColumnKey {
  Name = 'name',
  Type = 'type',
  EndDate = 'end-date',
}

export function dateTimeTimeZoneRenderer(value: string | null, timeZone: string) {
  return value ? moment(value).tz(timeZone).format('YYYY-MM-DD HH:mm') : '';
}

export function getAvailableEventsTableColumns() {
  return [
    {
      key: ColumnKey.Name,
      dataIndex: 'event.name',
      render: (value: string, row: CourseEvent) => {
        if (!row.event.descriptionUrl) return value;

        return (
          <a target="_blank" href={row.event.descriptionUrl}>
            {row.event.name}
          </a>
        );
      },
    },
    {
      key: ColumnKey.Type,
      dataIndex: 'event.type',
      render: (value: string, row: CourseEvent) => {
        if (!row.event.type) return value;

        return <Tag>{row.event.type}</Tag>;
      },
    },
    {
      key: ColumnKey.EndDate,
      dataIndex: 'dateTime',
      // render: coloredDateRenderer(timezone, 'YYYY-MM-DD HH:mm', 'start', 'Recommended date for studying'),
      render: (_: string, row: CourseEvent) => {
        return row.dateTime;
      },
    },
  ];
}

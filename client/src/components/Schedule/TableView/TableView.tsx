import { Form, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { CourseScheduleItemDto } from 'api';
import { GithubUserLink } from 'components/GithubUserLink';
import {
  coloredDateRenderer,
  dateSorter,
  getColumnSearchProps,
  renderTagWithStyle,
  scoreRenderer,
  weightRenderer,
} from 'components/Table';
import { TASK_EVENT_TYPES_MAP } from 'data';
import React, { useMemo } from 'react';
import { useLocalStorage } from 'react-use';
import { ColumnKey, ColumnName, CONFIGURABLE_COLUMNS, LocalStorageKeys, SCHEDULE_STATUSES } from '../constants';
import { ScheduleSettings } from '../useScheduleSettings';
import { statusRenderer } from './renderers';

const TAG_NAMES_MAP = TASK_EVENT_TYPES_MAP;

const getColumns = ({
  timezone,
  tagColors,
  statusFilter,
}: {
  statusFilter: string[];
  timezone: string;
  tagColors: Record<string, string>;
}): ColumnsType<CourseScheduleItemDto> => [
  {
    key: ColumnKey.Status,
    title: ColumnName.Status,
    dataIndex: 'status',
    render: statusRenderer,
    filters: SCHEDULE_STATUSES.map(status => ({ text: statusRenderer(status.value), value: status.value })),
    defaultFilteredValue: statusFilter,
    filtered: statusFilter.length > 0,
  },
  {
    key: ColumnKey.Name,
    title: ColumnName.Name,
    dataIndex: 'name',
    render: (value: string, row: CourseScheduleItemDto) => {
      if (!row.descriptionUrl) return value;

      return (
        <a target="_blank" href={row.descriptionUrl}>
          {value}
        </a>
      );
    },
    ...getColumnSearchProps('name'),
  },
  {
    key: ColumnKey.Tags,
    title: ColumnName.Tags,
    dataIndex: 'tags',
    render: (tagNames: string[]) =>
      tagNames?.filter(Boolean).map(tagName => renderTagWithStyle(tagName, tagColors, TAG_NAMES_MAP)),
  },
  {
    key: ColumnKey.StartDate,
    title: ColumnName.StartDate,
    dataIndex: 'studentStartDate',
    render: coloredDateRenderer(timezone, 'YYYY-MM-DD HH:mm', 'start', 'Recommended date for studying'),
    sorter: dateSorter('studentStartDate'),
    sortDirections: ['descend', 'ascend'],
  },
  {
    key: ColumnKey.EndDate,
    title: (
      <Tooltip title="Task's deadline in your time zone" overlayStyle={{ maxWidth: 132 }}>
        <div>{ColumnName.EndDate}</div>
      </Tooltip>
    ),
    dataIndex: 'studentEndDate',
    render: coloredDateRenderer(timezone, 'YYYY-MM-DD HH:mm', 'end', 'Recommended deadline'),
    sorter: dateSorter('studentEndDate'),
    sortDirections: ['descend', 'ascend'],
  },
  {
    key: ColumnKey.Organizer,
    title: ColumnName.Organizer,
    dataIndex: ['organizer', 'githubId'],
    render: (value: string) => !!value && <GithubUserLink value={value} />,
    ...getColumnSearchProps('organizer.githubId'),
  },
  {
    key: ColumnKey.Weight,
    title: ColumnName.Weight,
    dataIndex: ['scoreWeight'],
    render: weightRenderer,
    align: 'right',
  },
  {
    key: ColumnKey.Score,
    title: ColumnName.Score,
    render: scoreRenderer,
    align: 'right',
  },
];

interface TableViewProps {
  settings: ScheduleSettings;
  data: CourseScheduleItemDto[];
}

export function TableView({ data, settings }: TableViewProps) {
  const [form] = Form.useForm();
  const [statusFilter = [], setStatusFilter] = useLocalStorage<string[]>(LocalStorageKeys.EventTypesHidden);

  const filteredData = data.filter(event => {
    return statusFilter?.length > 0 ? statusFilter.includes(event.status) : event;
  });

  const filteredColumns = useMemo(
    () =>
      getColumns({
        tagColors: settings.tagColors,
        timezone: settings.timezone,
        statusFilter,
      }).filter(column => {
        const key = (column.key as ColumnKey) ?? ColumnKey.Name;
        return CONFIGURABLE_COLUMNS.includes(key) ? !settings.columnsHidden.includes(key) : true;
      }),
    [settings.columnsHidden, settings.timezone, settings.tagColors, statusFilter],
  );
  const columns = filteredColumns as ColumnsType<CourseScheduleItemDto>;

  return (
    <Form form={form} component={false}>
      <Table
        locale={{
          // disable default tooltips on sortable columns
          triggerDesc: undefined,
          triggerAsc: undefined,
          cancelSort: undefined,
        }}
        onChange={(_, filters) => {
          setStatusFilter((filters?.status as string[]) ?? []);
        }}
        rowKey={({ dataSource, dataSourceId }) => `${dataSource}${dataSourceId}`}
        pagination={false}
        dataSource={filteredData}
        size="middle"
        columns={columns}
      />
    </Form>
  );
}

export default TableView;

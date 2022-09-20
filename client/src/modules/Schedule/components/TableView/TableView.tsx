import { Form, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { CourseScheduleItemDto } from 'api';
import { GithubUserLink } from 'components/GithubUserLink';
import { dateSorter, getColumnSearchProps, scoreRenderer, weightRenderer } from 'components/Table';
import {
  ColumnKey,
  ColumnName,
  CONFIGURABLE_COLUMNS,
  LocalStorageKeys,
  SCHEDULE_STATUSES,
  TAGS,
} from 'modules/Schedule/constants';
import { ScheduleSettings } from 'modules/Schedule/hooks/useScheduleSettings';
import { useMemo } from 'react';
import { useLocalStorage } from 'react-use';
import moment from 'moment-timezone';
import { statusRenderer, renderTagWithStyle, coloredDateRenderer } from './renderers';

const getColumns = ({
  timezone,
  tagColors,
  statusFilter,
  tagFilter,
}: {
  statusFilter: string[];
  tagFilter: string[];
  timezone: string;
  tagColors: Record<string, string>;
}): ColumnsType<CourseScheduleItemDto> => {
  const timezoneOffset = `(UTC ${moment().tz(timezone).format('Z')})`;
  return [
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
      key: ColumnKey.Tag,
      title: ColumnName.Tag,
      dataIndex: 'tag',
      render: (tag: CourseScheduleItemDto['tag']) => renderTagWithStyle(tag, tagColors),
      filters: TAGS.map(status => ({ text: renderTagWithStyle(status.value, tagColors), value: status.value })),
      defaultFilteredValue: tagFilter,
      filtered: tagFilter.length > 0,
    },
    {
      key: ColumnKey.StartDate,
      title: (
        <span>
          {ColumnName.StartDate} {timezoneOffset}
        </span>
      ),
      dataIndex: 'startDate',
      render: coloredDateRenderer(timezone, 'YYYY-MM-DD HH:mm', 'start', 'Recommended date for studying'),
      sorter: dateSorter('startDate'),
      sortDirections: ['descend', 'ascend'],
    },
    {
      key: ColumnKey.EndDate,
      title: (
        <span>
          {ColumnName.EndDate} {timezoneOffset}
        </span>
      ),
      dataIndex: 'endDate',
      render: coloredDateRenderer(timezone, 'YYYY-MM-DD HH:mm', 'end', 'Recommended deadline'),
      sorter: dateSorter('endDate'),
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
};

export interface TableViewProps {
  settings: ScheduleSettings;
  data: CourseScheduleItemDto[];
}

export function TableView({ data, settings }: TableViewProps) {
  const [form] = Form.useForm();
  const [statusFilter = [], setStatusFilter] = useLocalStorage<string[]>(LocalStorageKeys.StatusFilter);
  const [tagFilter = [], setTagFilter] = useLocalStorage<string[]>(LocalStorageKeys.TagFilter);

  const filteredData = data
    .filter(item => (statusFilter?.length > 0 ? statusFilter.includes(item.status) : item))
    .filter(event => (tagFilter?.length > 0 ? tagFilter.includes(event.tag) : event));

  const filteredColumns = useMemo(
    () =>
      getColumns({
        tagColors: settings.tagColors,
        timezone: settings.timezone,
        statusFilter,
        tagFilter,
      }).filter(column => {
        const key = (column.key as ColumnKey) ?? ColumnKey.Name;
        return CONFIGURABLE_COLUMNS.includes(key) ? !settings.columnsHidden.includes(key) : true;
      }),
    [settings.columnsHidden, settings.timezone, settings.tagColors, statusFilter, tagFilter],
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
          setTagFilter((filters?.tag as string[]) ?? []);
        }}
        pagination={false}
        dataSource={filteredData}
        rowKey="name"
        size="middle"
        columns={columns}
      />
    </Form>
  );
}

export default TableView;

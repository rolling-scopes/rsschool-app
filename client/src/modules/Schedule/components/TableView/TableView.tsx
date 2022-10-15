import { Form, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { CourseScheduleItemDto } from 'api';
import { GithubUserLink } from 'components/GithubUserLink';
import { dateSorter, getColumnSearchProps, scoreRenderer, weightRenderer } from 'components/Table';
import FilteredTags from 'modules/Schedule/components/FilteredTags';
import {
  ALL_TAB_KEY,
  ColumnKey,
  ColumnName,
  CONFIGURABLE_COLUMNS,
  LocalStorageKeys,
  TAGS,
} from 'modules/Schedule/constants';
import { ScheduleSettings } from 'modules/Schedule/hooks/useScheduleSettings';
import { useMemo, useState } from 'react';
import { useLocalStorage } from 'react-use';
import moment from 'moment-timezone';
import { statusRenderer, renderTagWithStyle, coloredDateRenderer } from './renderers';
import { FilterValue } from 'antd/lib/table/interface';

const getColumns = ({
  timezone,
  tagColors,
  tagFilter,
  filteredInfo,
}: {
  tagFilter: string[];
  timezone: string;
  tagColors: Record<string, string>;
  filteredInfo: Record<string, FilterValue | null>;
}): ColumnsType<CourseScheduleItemDto> => {
  const timezoneOffset = `(UTC ${moment().tz(timezone).format('Z')})`;
  return [
    {
      key: ColumnKey.Status,
      title: ColumnName.Status,
      dataIndex: 'status',
      render: statusRenderer,
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
      filteredValue: filteredInfo.name || null,
      ...getColumnSearchProps('name'),
    },
    {
      key: ColumnKey.Type,
      title: ColumnName.Type,
      dataIndex: 'tag',
      render: (tag: CourseScheduleItemDto['tag']) => renderTagWithStyle(tag, tagColors),
      filters: TAGS.map(status => ({ text: renderTagWithStyle(status.value, tagColors), value: status.value })),
      defaultFilteredValue: tagFilter,
      filtered: tagFilter?.length > 0,
      filteredValue: tagFilter || null,
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
      filteredValue: filteredInfo.organizer || null,
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
  statusFilter?: string;
}

const hasStatusFilter = (statusFilter?: string, itemStatus?: string) =>
  Array.isArray(statusFilter) || statusFilter === ALL_TAB_KEY || itemStatus === statusFilter;

export function TableView({ data, settings, statusFilter = ALL_TAB_KEY }: TableViewProps) {
  const [form] = Form.useForm();
  const [tagFilter = [], setTagFilter] = useLocalStorage<string[]>(LocalStorageKeys.TagFilter);
  const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | string[] | null>>({});

  const filteredData = data
    .filter(item => (hasStatusFilter(statusFilter, item.status) ? item : null))
    .filter(event => (tagFilter?.length > 0 ? tagFilter.includes(event.tag) : event));

  const filteredColumns = useMemo(
    () =>
      getColumns({
        tagColors: settings.tagColors,
        timezone: settings.timezone,
        tagFilter,
        filteredInfo,
      }).filter(column => {
        const key = (column.key as ColumnKey) ?? ColumnKey.Name;
        return CONFIGURABLE_COLUMNS.includes(key) ? !settings.columnsHidden.includes(key) : true;
      }),
    [settings.columnsHidden, settings.timezone, settings.tagColors, statusFilter, tagFilter],
  );
  const columns = filteredColumns as ColumnsType<CourseScheduleItemDto>;

  const handleTagClose = (removedTag: string) => {
    setTagFilter(tagFilter.filter(t => t !== removedTag));
  };

  const handleClearAllButtonClick = () => {
    setTagFilter([]);
  };

  return (
    <Form form={form} component={false}>
      <FilteredTags
        tagFilter={tagFilter}
        onTagClose={handleTagClose}
        onClearAllButtonClick={handleClearAllButtonClick}
      />
      <Table
        locale={{
          // disable default tooltips on sortable columns
          triggerDesc: undefined,
          triggerAsc: undefined,
          cancelSort: undefined,
        }}
        onChange={(_, filters: Record<ColumnKey, FilterValue | string[] | null>) => {
          setTagFilter(filters?.type as string[]);
          setFilteredInfo(filters);
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

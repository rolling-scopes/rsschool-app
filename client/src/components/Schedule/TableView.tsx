import { SettingOutlined } from '@ant-design/icons';
import { Table, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { GithubUserLink } from 'components';
import {
  dateSorter,
  getColumnSearchProps,
  tagsRenderer,
  dateWithTimeZoneRenderer,
  urlRenderer,
  placeRenderer,
  renderTag,
} from 'components/Table';
import { CourseEvent } from 'services/course';
import { TaskTypes } from './model';
import { EventTypeColor, EventTypeToName } from 'components/Schedule/model';

const { Text } = Typography;

type Props = {
  data: CourseEvent[];
  timeZone: string;
};

const getColumns = (timeZone: string) =>
  [
    {
      title: <SettingOutlined />,
      width: 20,
      dataIndex: '#',
      render: (_text: string, _record: CourseEvent, index: number) => index + 1,
    },
    {
      title: 'Date',
      width: 120,
      dataIndex: 'dateTime',
      render: dateWithTimeZoneRenderer(timeZone, 'MMM Do YYYY'),
      sorter: dateSorter('dateTime'),
      sortDirections: ['descend', 'ascend'],
      defaultSortOrder: 'descend',
    },
    { title: 'Time', width: 60, dataIndex: 'dateTime', render: dateWithTimeZoneRenderer(timeZone, 'HH:mm') },
    {
      title: 'Type',
      width: 120,
      dataIndex: ['event', 'type'],
      render: (value: keyof typeof EventTypeColor) => renderTag(EventTypeToName[value] || value, EventTypeColor[value]),
    },
    {
      title: 'Special',
      width: 150,
      dataIndex: 'special',
      render: (tags: string) => !!tags && tagsRenderer(tags.split(',')),
    },
    {
      title: 'Name',
      dataIndex: ['event', 'name'],
      render: (value: string) => <Text strong>{value}</Text>,
      ...getColumnSearchProps('event.name'),
    },
    {
      title: 'Url',
      width: 30,
      dataIndex: ['event', 'descriptionUrl'],
      render: urlRenderer,
    },
    { title: 'Duration', width: 60, dataIndex: 'duration' },
    {
      title: 'Organizer',
      width: 140,
      dataIndex: ['organizer', 'githubId'],
      render: (value: string) => !!value && <GithubUserLink value={value} />,
      ...getColumnSearchProps('organizer.githubId'),
    },
    {
      title: 'Place',
      dataIndex: 'place',
      render: placeRenderer,
      onCell: () => {
        return {
          style: {
            whiteSpace: 'nowrap',
            maxWidth: 250,
          },
        };
      },
    },
  ] as ColumnsType<CourseEvent>;

export function TableView({ data, timeZone }: Props) {
  return (
    <Table
      rowKey={record => (record.event.type === TaskTypes.deadline ? `${record.id}d` : record.id).toString()}
      pagination={false}
      dataSource={data}
      size="middle"
      columns={getColumns(timeZone)}
    />
  );
}

export default TableView;

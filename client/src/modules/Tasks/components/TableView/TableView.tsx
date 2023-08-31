import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { TaskDto } from 'api';
import {
  stringSorter,
  getColumnSearchProps,
  tagsRenderer,
  tagsCoursesRendererWithRemainingNumber,
  boolIconRenderer,
} from 'components/Table';
import { TASK_TYPES } from 'data/taskTypes';
import { uniqBy } from 'lodash';
import { useMemo } from 'react';

function getColumns(
  handleEditItem: (record: TaskDto) => Promise<void>,
  allUsedCourses: string[],
): ColumnsType<TaskDto> {
  return [
    {
      title: 'Id',
      dataIndex: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: stringSorter<TaskDto>('name'),
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Discipline',
      dataIndex: ['discipline', 'name'],
      sorter: stringSorter<TaskDto>('discipline'),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      render: tagsRenderer,
    },
    {
      title: 'Skills',
      dataIndex: 'skills',
      render: tagsRenderer,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      sorter: stringSorter<TaskDto>('type'),
      filters: TASK_TYPES.map(type => ({ text: type.name, value: type.id })),
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Used in Courses',
      dataIndex: ['courses', 'name'],
      render: tagsCoursesRendererWithRemainingNumber,
      filters: [
        { text: 'Not assigned', value: '' },
        ...allUsedCourses.map(course => ({ text: course, value: course })),
      ],
      onFilter: (value, record) =>
        value ? record.courses.some(({ name }) => name === `${value}`) : record.courses.length === 0,
    },
    {
      title: 'Description URL',
      dataIndex: 'descriptionUrl',
      render: (value: string) =>
        value ? (
          <a title={value} href={value}>
            Link
          </a>
        ) : null,
      width: 80,
    },
    {
      title: 'PR Required',
      dataIndex: 'githubPrRequired',
      render: boolIconRenderer,
      width: 80,
    },
    {
      title: 'Repo Name',
      dataIndex: 'githubRepoName',
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_, record) => <a onClick={() => handleEditItem(record)}>Edit</a>,
    },
  ];
}

type Props = {
  data: TaskDto[];
  handleEditItem: (record: TaskDto) => Promise<void>;
};

export const TableView = ({ data, handleEditItem }: Props) => {
  const allUsedCourses = useMemo(
    () =>
      uniqBy(
        data.flatMap(({ courses }) => courses),
        course => course.name,
      )
        .map(({ name }) => name)
        .sort(),
    [data],
  );

  return (
    <Table
      size="small"
      style={{ marginTop: 8 }}
      dataSource={data}
      pagination={{ pageSize: 100, showSizeChanger: false }}
      rowKey="id"
      columns={getColumns(handleEditItem, allUsedCourses)}
    />
  );
};

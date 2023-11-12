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
import { ColumnName } from 'modules/Tasks/types';
import { useMemo } from 'react';

function getColumns(
  handleEditItem: (record: TaskDto) => Promise<void>,
  allUsedCourses: string[],
): ColumnsType<TaskDto> {
  return [
    {
      title: ColumnName.Id,
      dataIndex: 'id',
      fixed: true,
    },
    {
      title: ColumnName.Name,
      dataIndex: 'name',
      sorter: stringSorter<TaskDto>('name'),
      ...getColumnSearchProps('name'),
    },
    {
      title: ColumnName.Discipline,
      dataIndex: ['discipline', 'name'],
      sorter: stringSorter<TaskDto>('discipline'),
    },
    {
      title: ColumnName.Tags,
      dataIndex: 'tags',
      render: tagsRenderer,
    },
    {
      title: ColumnName.Skills,
      dataIndex: 'skills',
      render: tagsRenderer,
    },
    {
      title: ColumnName.Type,
      dataIndex: 'type',
      sorter: stringSorter<TaskDto>('type'),
      filters: TASK_TYPES.map(type => ({ text: type.name, value: type.id })),
      onFilter: (value, record) => record.type === value,
    },
    {
      title: ColumnName.UsedInCourses,
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
      title: ColumnName.DescriptionURL,
      dataIndex: 'descriptionUrl',
      render: (value: string) =>
        value ? (
          <a title={value} href={value} target="_blank">
            Link
          </a>
        ) : null,
      width: 80,
    },
    {
      title: ColumnName.PRRequired,
      dataIndex: 'githubPrRequired',
      render: boolIconRenderer,
      width: 80,
    },
    {
      title: ColumnName.RepoName,
      dataIndex: 'githubRepoName',
    },
    {
      title: ColumnName.Actions,
      dataIndex: 'actions',
      render: (_, record) => <a onClick={() => handleEditItem(record)}>Edit</a>,
    },
  ];
}

type Props = {
  data: TaskDto[];
  handleEditItem: (record: TaskDto) => Promise<void>;
};

export const TasksTable = ({ data, handleEditItem }: Props) => {
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

import React, { useMemo, useState } from 'react';
import { SettingOutlined } from '@ant-design/icons';
import { Popconfirm, Table, Typography, Space, Form, Button, message } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment-timezone';
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
import { CourseEvent, CourseService } from 'services/course';
import { ScheduleRow, TaskTypes } from './model';
import { EventTypeColor, EventTypeToName } from 'components/Schedule/model';
import EditableCell from './EditableCell';

const { Text } = Typography;

type Props = {
  data: CourseEvent[];
  timeZone: string;
  isAdmin: boolean;
  courseId: number;
  refreshData: Function;
};

const getColumns = (timeZone: string) => [
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
    editable: true,
  },
  {
    title: 'Time',
    width: 60,
    dataIndex: 'dateTime',
    render: dateWithTimeZoneRenderer(timeZone, 'HH:mm'),
    editable: true,
  },
  {
    title: 'Type',
    width: 120,
    dataIndex: ['event', 'type'],
    render: (value: keyof typeof EventTypeColor) => renderTag(EventTypeToName[value] || value, EventTypeColor[value]),
    editable: true,
  },
  {
    title: 'Special',
    width: 150,
    dataIndex: ['special'],
    render: (tags: string) => !!tags && tagsRenderer(tags.split(',')),
    editable: true,
  },
  {
    title: 'Name',
    width: 150,
    dataIndex: ['event', 'name'],
    render: (value: string) => <Text strong>{value}</Text>,
    ...getColumnSearchProps('event.name'),
    editable: true,
  },
  {
    title: 'Url',
    width: 30,
    dataIndex: ['event', 'descriptionUrl'],
    render: urlRenderer,
    editable: true,
  },
  { title: 'Duration', width: 60, dataIndex: 'duration', editable: true },
  {
    title: 'Organizer',
    width: 140,
    dataIndex: ['organizer', 'githubId'],
    render: (value: string) => !!value && <GithubUserLink value={value} />,
    ...getColumnSearchProps('organizer.githubId'),
    editable: true,
  },
  {
    title: 'Place',
    dataIndex: 'place',
    render: placeRenderer,
    onCell: () => {
      return {
        style: {
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          maxWidth: 250,
        },
      };
    },
    editable: true,
  },
];

export function TableView({ data, timeZone, isAdmin, courseId, refreshData }: Props) {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);

  const isEditing = (record: CourseEvent) => record.id.toString() === editingKey;

  const edit = (record: CourseEvent) => {
    form.setFieldsValue({
      ...record,
      dateTime: moment(record.dateTime),
      time: moment(record.dateTime),
      special: record.special ? record.special.split(',') : [],
    });
    setEditingKey(record.id.toString());
  };

  const handleDelete = async (id: number) => {
    try {
      await courseService.deleteCourseEvent(id);
      await refreshData();
    } catch {
      message.error('Failed to delete item. Please try later.');
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key: React.Key) => {
    const updatedRow = (await form.validateFields()) as ScheduleRow;
    const index = data.findIndex(item => key === item.id.toString());

    if (index > -1) {
      const editableEvent = data[index];

      updateEvent(editableEvent, updatedRow);
      try {
        await courseService.updateCourseEvent(editableEvent.id, editableEvent);
        await refreshData();
      } catch {
        message.error('An error occurred. Please try later.');
      }
    }

    setEditingKey('');
  };

  const getAdminColumn = (isAdmin: boolean) => {
    if (!isAdmin) {
      return [];
    }

    return [
      {
        title: 'Action',
        key: 'action',
        render: (_: any, record: CourseEvent) => {
          const editable = isEditing(record);

          return editable ? (
            <span>
              <a
                onClick={event => {
                  event.stopPropagation();
                  save(record.id.toString());
                }}
                style={{ marginRight: 8 }}
              >
                Save
              </a>
              <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                <a>Cancel</a>
              </Popconfirm>
            </span>
          ) : (
            <Space>
              <Button
                type="link"
                style={{ padding: 0 }}
                disabled={editingKey !== ''}
                onClick={event => {
                  event.stopPropagation();
                  edit(record);
                }}
              >
                Edit
              </Button>
              <Popconfirm
                title="Sure to delete?"
                onConfirm={() => {
                  handleDelete(record.id);
                }}
              >
                <Button type="link" style={{ padding: 0 }} disabled={editingKey !== ''}>
                  Delete
                </Button>
              </Popconfirm>
            </Space>
          );
        },
      },
    ];
  };

  const columns = [...getColumns(timeZone), ...getAdminColumn(isAdmin)] as ColumnsType<CourseEvent>;

  const mergedColumns = columns.map((col: any) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: CourseEvent) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        rowKey={record => (record.event.type === TaskTypes.deadline ? `${record.id}d` : record.id).toString()}
        pagination={false}
        dataSource={data}
        size="middle"
        columns={mergedColumns}
        rowClassName="editable-row"
      />
    </Form>
  );
}

const updateEvent = (row: CourseEvent, updatedRow: ScheduleRow) => {
  row.dateTime = updatedRow.dateTime;
  row.event.type = updatedRow.event.type;
  row.special = updatedRow.special ? updatedRow.special.join(',') : '';
  row.event.name = updatedRow.event.name;
  row.event.descriptionUrl = updatedRow.event.descriptionUrl;
  row.duration = updatedRow.duration;
  row.organizer.githubId = updatedRow.organizer.githubId;
  row.place = updatedRow.place;
};

export default TableView;

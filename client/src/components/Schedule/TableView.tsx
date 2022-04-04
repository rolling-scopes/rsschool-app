import React, { useMemo, useState } from 'react';
import { Popconfirm, Table, Typography, Space, Form, Button, message } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment-timezone';
import mergeWith from 'lodash/mergeWith';
import { GithubUserLink } from 'components/GithubUserLink';
import {
  dateSorter,
  getColumnSearchProps,
  tagsRenderer,
  dateWithTimeZoneRenderer,
  renderTagWithStyle,
  scoreRenderer,
} from 'components/Table';
import { CourseEvent, CourseService } from 'services/course';
import { ScheduleRow, Column, CONFIGURABLE_COLUMNS } from './model';
import { Settings } from './types';
import EditableCell from './EditableCell';
import { EventService } from 'services/event';
import { Task, TaskService } from 'services/task';
import { DEFAULT_COLORS } from './ScheduleSettings/scheduleSettingsHandlers';
import { TASK_TYPES_MAP } from 'data/taskTypes';

const { Text } = Typography;

const eventService = new EventService();
const taskService = new TaskService();

type Props = {
  data: CourseEvent[];
  timeZone: string;
  isAdmin: boolean;
  courseId: number;
  refreshData: Function;
  columnsShown: string[];
  tagColors?: object;
  limitForDoneTask?: number;
  alias: string;
  settings: Settings;
};

const getColumns = ({
  timeZone,
  tagColors,
  splittedByWeek,
}: {
  timeZone: string;
  tagColors: object;
  splittedByWeek?: boolean;
}) => [
  {
    key: 'Date',
    title: Column.Date,
    dataIndex: 'dateTime',
    render: splittedByWeek
      ? dateWithTimeZoneRenderer(timeZone, 'ddd - MMM Do YYYY')
      : dateWithTimeZoneRenderer(timeZone, 'MMM Do YYYY'),
    sorter: dateSorter('dateTime'),
    sortDirections: ['descend', 'ascend'],
    editable: true,
  },
  {
    key: 'Time',
    title: Column.Time,
    dataIndex: 'dateTime',
    render: dateWithTimeZoneRenderer(timeZone, 'HH:mm'),
    editable: true,
  },
  {
    key: 'Type',
    title: Column.Type,
    dataIndex: ['event', 'type'],
    render: (tagName: string) => renderTagWithStyle(tagName, tagColors, TASK_TYPES_MAP),
    editable: true,
    visible: false,
  },
  {
    key: 'Special',
    title: Column.Special,
    dataIndex: ['special'],
    render: (tags: string) => !!tags && tagsRenderer(tags.split(',')),
    editable: true,
  },
  {
    key: 'Name',
    title: Column.Name,
    dataIndex: ['event', 'name'],
    render: (value: string, row: any) => {
      return (
        <Text style={{ width: '100%', height: '100%', display: 'block' }} strong>
          {row?.event?.descriptionUrl ? (
            <a target="_blank" href={row.event.descriptionUrl}>
              {value}
            </a>
          ) : (
            <span>{value}</span>
          )}
        </Text>
      );
    },
    ...getColumnSearchProps('event.name'),
    editable: true,
  },
  {
    key: 'Organizer',
    title: Column.Organizer,
    dataIndex: ['organizer', 'githubId'],
    render: (value: string) => !!value && <GithubUserLink value={value} />,
    ...getColumnSearchProps('organizer.githubId'),
    editable: true,
  },
  {
    key: 'Score',
    title: Column.Score,
    dataIndex: 'score',
    render: scoreRenderer,
  },
];

export function TableView({
  data,
  timeZone,
  isAdmin,
  courseId,
  refreshData,
  limitForDoneTask,
  columnsShown,
  settings,
  tagColors = DEFAULT_COLORS,
}: Props) {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);

  const isEditing = (record: CourseEvent) => `${record.id}${record.event.type}${record.event.name}` === editingKey;

  const edit = (record: CourseEvent) => {
    form.setFieldsValue({
      ...record,
      dateTime: moment(record.dateTime),
      time: moment(record.dateTime),
      special: record.special ? record.special.split(',') : [],
    });
    setEditingKey(`${record.id}${record.event.type}${record.event.name}`);
  };

  const handleDelete = async (id: number, isTask?: boolean) => {
    try {
      if (isTask) {
        await courseService.deleteCourseTask(id);
      } else {
        await courseService.deleteCourseEvent(id);
      }

      await refreshData();
    } catch {
      message.error(`Failed to delete ${isTask ? 'task' : 'event'}. Please try later.`);
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (id: number, isTask?: boolean) => {
    const updatedRow = (await form.validateFields()) as ScheduleRow;
    const index = data.findIndex(item => id === item.id);

    updatedRow.organizer = updatedRow.organizer && updatedRow.organizer.githubId ? updatedRow.organizer : null;

    if (index > -1) {
      const editableEntity = data[index];

      mergeWith(editableEntity, updatedRow);
      editableEntity.special = updatedRow.special ? updatedRow.special.join(',') : '';

      try {
        if (isTask) {
          await taskService.updateTask(editableEntity.event.id, getNewDataForUpdate(editableEntity) as Partial<Task>);
          await courseService.updateCourseTask(editableEntity.id, getCourseTaskDataForUpdate(editableEntity));
        } else {
          await eventService.updateEvent(editableEntity.event.id, getNewDataForUpdate(editableEntity));
          await courseService.updateCourseEvent(editableEntity.id, getCourseEventDataForUpdate(editableEntity));
        }
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
                  save(record.id, record.isTask);
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
                  handleDelete(record.id, record.isTask);
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

  const filteredData = data.filter(({ event }) => !settings.eventTypesHidden.includes(event.type));
  const filteredColumns = getColumns({ timeZone, tagColors, splittedByWeek: settings.splittedByWeek }).filter(column =>
    CONFIGURABLE_COLUMNS.includes(column.key) ? columnsShown.includes(column.key) : true,
  );
  const columns = [...filteredColumns, ...getAdminColumn(isAdmin)] as ColumnsType<CourseEvent>;

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
        rowKey={({ event, id }) => `${id}${event.type}`}
        pagination={false}
        dataSource={filteredData}
        size="middle"
        columns={mergedColumns}
        rowClassName={record => getTableRowClass(record, settings.splittedByWeek, limitForDoneTask)}
      />
    </Form>
  );
}

const getCourseEventDataForUpdate = (entity: CourseEvent) => {
  return {
    dateTime: entity.dateTime,
    organizerId: entity.organizer ? entity.organizer.githubId : null,
    place: entity.place || '',
    special: entity.special || '',
  };
};

const getCourseTaskDataForUpdate = (entity: CourseEvent) => {
  const taskDate = entity.event.type !== 'deadline' ? 'studentStartDate' : 'studentEndDate';

  const dataForUpdate = {
    [taskDate]: entity.dateTime,
    taskOwnerId: entity.organizer ? entity.organizer.githubId : null,
    special: entity.special || '',
  };

  if (entity.event.type !== 'deadline') {
    return { ...dataForUpdate, type: entity.event.type };
  }

  return dataForUpdate;
};

const getNewDataForUpdate = (entity: CourseEvent) => {
  const dataForUpdate = {
    name: entity.event.name,
    descriptionUrl: entity.event.descriptionUrl || '',
  };

  if (entity.event.type !== 'deadline') {
    return { ...dataForUpdate, type: entity.event.type };
  }

  return dataForUpdate;
};

const getTableRowClass = (record: CourseEvent, isSplitedByWeek?: boolean, limitForDoneTask?: number): string => {
  if (limitForDoneTask && record.done && record.done >= limitForDoneTask) {
    return 'table-row-done';
  }

  if (moment(record.dateTime).year() === moment().year() && moment(record.dateTime).isoWeek() === moment().isoWeek()) {
    if (moment(record.dateTime).isoWeekday() === moment().isoWeekday()) {
      return 'table-row-current-day';
    } else {
      return 'table-row-current';
    }
  }

  if (!isSplitedByWeek) {
    return '';
  }

  return moment(record.dateTime).week() % 2 === 0 ? '' : 'table-row-odd';
};

export default TableView;

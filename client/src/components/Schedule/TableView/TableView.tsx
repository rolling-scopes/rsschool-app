import moment from 'moment-timezone';
import React, { useMemo, useState } from 'react';
import { Popconfirm, Table, Typography, Space, Form, Button, Tooltip, message } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { CourseEvent, CourseService, CourseTaskDetails } from 'services/course';
import { EventService } from 'services/event';
import { TaskService, Task } from 'services/task';
import { TASK_TYPES_MAP } from 'data/taskTypes';
import { GithubUserLink } from 'components/GithubUserLink';
import {
  dateSorter,
  getColumnSearchProps,
  coloredDateRenderer,
  renderTagWithStyle,
  scoreRenderer,
} from 'components/Table';
import { Column, CONFIGURABLE_COLUMNS } from '../constants';
import { ScheduleViewProps } from '../ScheduleView';
import EditableCell from './EditableCell';
import { ScheduleEvent } from '../model';

const { Text } = Typography;

const eventService = new EventService();
const taskService = new TaskService();

const getColumns = ({
  timezone,
  tagColors,
}: {
  timezone: string;
  tagColors: Record<string, string>;
  splittedByWeek?: boolean;
}) => [
  {
    key: 'Type',
    title: Column.Type,
    dataIndex: 'type',
    render: (tagName: string) => renderTagWithStyle(tagName, tagColors, TASK_TYPES_MAP),
    editable: true,
    visible: false,
  },
  {
    key: 'Name',
    title: Column.Name,
    dataIndex: 'name',
    render: (value: string, row: any) => {
      return (
        <Text style={{ width: '100%', height: '100%', display: 'block' }} strong>
          {row.descriptionUrl ? (
            <a target="_blank" href={row.descriptionUrl}>
              {value}
            </a>
          ) : (
            <span>{value}</span>
          )}
        </Text>
      );
    },
    ...getColumnSearchProps('name'),
    editable: true,
  },
  {
    key: 'StartDate',
    title: (
      <Tooltip title="Run a task in your time zone" overlayStyle={{ maxWidth: 132 }}>
        <div>{Column.StartDate}</div>
      </Tooltip>
    ),
    dataIndex: 'startDate',
    render: coloredDateRenderer(timezone, 'YYYY-MM-DD HH:mm', 'start'),
    sorter: dateSorter('startDate'),
    sortDirections: ['descend', 'ascend'],
    editable: true,
  },
  {
    key: 'EndDate',
    title: (
      <Tooltip title="Task's deadline in your time zone" overlayStyle={{ maxWidth: 132 }}>
        <div>{Column.EndDate}</div>
      </Tooltip>
    ),
    dataIndex: 'endDate',
    render: coloredDateRenderer(timezone, 'YYYY-MM-DD HH:mm', 'end'),
    sorter: dateSorter('endDate'),
    sortDirections: ['descend', 'ascend'],
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

export function TableView({ data, isAdmin, courseId, refreshData, settings }: ScheduleViewProps) {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);

  const isEditing = (record: ScheduleEvent) => `${record.id}${record.type}${record.name}` === editingKey;

  const edit = (record: ScheduleEvent) => {
    form.setFieldsValue(record);
    setEditingKey(`${record.id}${record.type}${record.name}`);
  };

  const handleDelete = async (id: number, isTask?: boolean) => {
    try {
      if (isTask) {
        await courseService.deleteCourseTask(id);
      } else {
        await courseService.deleteCourseEvent(id);
      }

      refreshData();
    } catch {
      message.error(`Failed to delete ${isTask ? 'task' : 'event'}. Please try later.`);
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (id: number, isTask: boolean) => {
    const updatedRow = await form.validateFields();
    const item = data.find(item => id === item.id);

    if (item) {
      const { githubId } = updatedRow.organizer;
      // TODO: it's temporary fix, need to rewrite / reconsider all the editing approach according to new design.
      const id = typeof githubId === 'number' ? githubId : null;
      updatedRow.organizer = {
        id: typeof githubId === 'string' ? item.organizer.id : id,
      };

      try {
        if (isTask) {
          await taskService.updateTask(
            (item.entity as CourseTaskDetails).taskId,
            getNewDataForUpdate(updatedRow) as Partial<Task>,
          );
          await courseService.updateCourseTask(item.id, getCourseTaskDataForUpdate(updatedRow));
        } else {
          await eventService.updateEvent((item.entity as CourseEvent).eventId, getNewDataForUpdate(updatedRow));
          await courseService.updateCourseEvent(item.id, getCourseEventDataForUpdate(updatedRow));
        }
        refreshData();
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
        render: (_: any, record: ScheduleEvent) => {
          const editable = isEditing(record);

          return editable ? (
            <span>
              <a
                onClick={event => {
                  event.stopPropagation();
                  save(record.id, record.category === 'task');
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
                  handleDelete(record.id, record.category === 'task');
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

  const filteredData = data.filter(event => !settings.eventTypesHidden.includes(event.type));
  const filteredColumns = getColumns({
    tagColors: settings.tagColors,
    timezone: settings.timezone,
    splittedByWeek: settings.isSplittedByWeek,
  }).filter(column =>
    CONFIGURABLE_COLUMNS.includes(column.key) ? !settings.columnsHidden.includes(column.key) : true,
  );
  const columns = [...filteredColumns, ...getAdminColumn(isAdmin)] as ColumnsType<CourseEvent>;

  const mergedColumns = columns.map((col: any) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: ScheduleEvent) => ({
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
        locale={{
          // disable default tooltips on sortable columns
          triggerDesc: undefined,
          triggerAsc: undefined,
          cancelSort: undefined,
        }}
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        rowKey={({ category, id }) => `${category}${id}`}
        pagination={false}
        dataSource={filteredData}
        size="middle"
        columns={mergedColumns}
        rowClassName={record => getTableRowClass(record, settings.isSplittedByWeek, settings.limitForDoneTask)}
      />
    </Form>
  );
}

const getCourseEventDataForUpdate = (entity: ScheduleEvent) => ({
  dateTime: entity.startDate,
  organizerId: entity.organizer.id,
});

const getCourseTaskDataForUpdate = (entity: ScheduleEvent) => ({
  studentStartDate: entity.startDate,
  studentEndDate: entity.endDate,
  taskOwnerId: entity.organizer.id,
  type: entity.type,
});

const getNewDataForUpdate = (entity: ScheduleEvent) => ({
  name: entity.name,
  type: entity.type,
});

const getTableRowClass = (record: ScheduleEvent, isSplitedByWeek?: boolean, limitForDoneTask?: number): string => {
  if (limitForDoneTask && record.score?.donePercent && record.score.donePercent >= limitForDoneTask) {
    return 'table-row-done';
  }

  if (
    moment(record.startDate).year() === moment().year() &&
    moment(record.startDate).isoWeek() === moment().isoWeek()
  ) {
    if (moment(record.startDate).isoWeekday() === moment().isoWeekday()) {
      return 'table-row-current-day';
    } else {
      return 'table-row-current';
    }
  }

  if (!isSplitedByWeek) {
    return '';
  }

  return moment(record.startDate).week() % 2 === 0 ? '' : 'table-row-odd';
};

export default TableView;

import React, { useMemo, useState } from 'react';
import { SettingOutlined } from '@ant-design/icons';
import { Popconfirm, Dropdown, Table, Typography, Space, Form, Button, message } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
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
import { ScheduleRow } from './model';
import EditableCell from './EditableCell';
import FilterComponent from '../Table/FilterComponent';
import Link from 'next/link';
import { EventService } from 'services/event';
import { Task, TaskService } from 'services/task';
import { useLocalStorage } from 'react-use';
import { DEFAULT_COLORS } from './UserSettings/userSettingsHandlers';

const { Text } = Typography;

const eventService = new EventService();
const taskService = new TaskService();

type Props = {
  data: CourseEvent[];
  timeZone: string;
  isAdmin: boolean;
  courseId: number;
  refreshData: Function;
  storedTagColors?: object;
  limitForDoneTask?: number;
  alias: string;
};

const styles = {
  backgroundColor: '#fff',
  boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
  borderRadius: '2px',
  padding: '15px',
};

const getColumns = (
  timeZone: string,
  hidenColumnsAndTypes: Array<string> = [],
  handleFilter: (event: CheckboxChangeEvent) => void,
  setHidenColumnsAndTypes: (e: Array<string>) => void,
  storedTagColors: object,
  distinctTags: Array<string>,
  alias: string,
  handleSplitByWeek: (event: CheckboxChangeEvent) => void,
  isSplitedByWeek: boolean | undefined,
) => [
  {
    title: (
      <Dropdown
        overlayStyle={styles}
        overlay={() => (
          <FilterComponent
            eventTypes={distinctTags}
            hidenColumnsAndTypes={hidenColumnsAndTypes}
            handleFilter={handleFilter}
            setHidenColumnsAndTypes={setHidenColumnsAndTypes}
            handleSplitByWeek={handleSplitByWeek}
            isSplitedByWeek={isSplitedByWeek}
          />
        )}
        placement="bottomRight"
        trigger={['click']}
      >
        <SettingOutlined />
      </Dropdown>
    ),
    dataIndex: '#',
    render: (_text: string, _record: CourseEvent, index: number) => index + 1,
  },
  {
    title: 'Date',
    dataIndex: 'dateTime',
    render: isSplitedByWeek
      ? dateWithTimeZoneRenderer(timeZone, 'ddd - MMM Do YYYY')
      : dateWithTimeZoneRenderer(timeZone, 'MMM Do YYYY'),
    sorter: dateSorter('dateTime'),
    sortDirections: ['descend', 'ascend'],
    editable: true,
  },
  {
    title: 'Time',
    dataIndex: 'dateTime',
    render: dateWithTimeZoneRenderer(timeZone, 'HH:mm'),
    editable: true,
  },
  {
    title: 'Type',
    dataIndex: ['event', 'type'],
    render: (tagName: string) => renderTagWithStyle(tagName, storedTagColors),
    editable: true,
  },
  {
    title: 'Special',
    dataIndex: ['special'],
    render: (tags: string) => !!tags && tagsRenderer(tags.split(',')),
    editable: true,
  },
  {
    title: 'Name',
    dataIndex: ['event', 'name'],
    render: (value: string, row: any) => {
      return (
        <Link
          href={`/course/entityDetails?course=${alias}&entityType=${row.isTask ? 'task' : 'event'}&entityId=${row.id}`}
        >
          <a>
            <Text style={{ width: '100%', height: '100%', display: 'block' }} strong>
              {value}
            </Text>
          </a>
        </Link>
      );
    },
    ...getColumnSearchProps('event.name'),
    editable: true,
  },
  { title: 'Duration', width: 60, dataIndex: 'duration', editable: true },
  {
    title: 'Organizer',
    dataIndex: ['organizer', 'githubId'],
    render: (value: string) => !!value && <GithubUserLink value={value} />,
    ...getColumnSearchProps('organizer.githubId'),
    editable: true,
  },
  {
    title: 'Score',
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
  storedTagColors = DEFAULT_COLORS,
  limitForDoneTask,
  alias,
}: Props) {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [hidenColumnsAndTypes, setHidenColumnsAndTypes] = useLocalStorage<string[]>('settingsTypesAndColumns', []);
  const [isSplitedByWeek, setIsSplitedByWeek] = useLocalStorage<boolean>('scheduleSplitedByWeek', false);
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const distinctTags = Array.from(new Set(data.map(element => element.event.type)));

  const isEditing = (record: CourseEvent) => `${record.id}${record.event.type}${record.event.name}` === editingKey;

  const edit = (record: CourseEvent) => {
    form.setFieldsValue({
      ...record,
      dateTime: moment(record.dateTime),
      time: moment(record.dateTime),
      special: record.special ? record.special.split(',') : [],
      duration: record.duration ? Number(record.duration) : null,
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

  const handleFilter = (event: CheckboxChangeEvent) => {
    const { value, checked } = event.target;
    if (checked && hidenColumnsAndTypes && hidenColumnsAndTypes.includes(value)) {
      const filteredTypesAndColumns = hidenColumnsAndTypes.filter(el => el !== value);
      setHidenColumnsAndTypes(filteredTypesAndColumns);
    }
    if (!checked && hidenColumnsAndTypes && !hidenColumnsAndTypes.includes(value)) {
      setHidenColumnsAndTypes([...hidenColumnsAndTypes, value]);
    }
  };

  const handleSplitByWeek = ({ target: { checked } }: CheckboxChangeEvent) => {
    setIsSplitedByWeek(checked);
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

  const filteredData = data.filter(
    element =>
      element?.event.type && hidenColumnsAndTypes && !hidenColumnsAndTypes.includes(element.event.type.toString()),
  );
  const sortedColumns = getColumns(
    timeZone,
    hidenColumnsAndTypes,
    handleFilter,
    setHidenColumnsAndTypes,
    storedTagColors,
    distinctTags,
    alias,
    handleSplitByWeek,
    isSplitedByWeek,
  ).filter(
    element => element?.title && hidenColumnsAndTypes && !hidenColumnsAndTypes.includes(element.title.toString()),
  );
  const columns = [...sortedColumns, ...getAdminColumn(isAdmin)] as ColumnsType<CourseEvent>;

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
        rowClassName={record => getTableRowClass(record, isSplitedByWeek, limitForDoneTask)}
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
    duration: entity.duration || null,
  };
};

const getCourseTaskDataForUpdate = (entity: CourseEvent) => {
  const taskDate = entity.event.type !== 'deadline' ? 'studentStartDate' : 'studentEndDate';

  const dataForUpdate = {
    [taskDate]: entity.dateTime,
    taskOwnerId: entity.organizer ? entity.organizer.githubId : null,
    special: entity.special || '',
    duration: entity.duration || null,
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

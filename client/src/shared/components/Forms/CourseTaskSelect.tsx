import { Select, Form } from 'antd';
import { CourseTaskDto } from '@client/api';
import { DeadlineIcon } from '@client/shared/components/Icons/DeadlineIcon';

export enum Group {
  Default = 'default',
  Deadline = 'deadline',
  CrossCheckDeadline = 'crossCheckDeadline',
}

export type GroupType = `${Group}`;

enum Section {
  Unknown = 'Unknown',
  AllTasks = 'All tasks',
  Future = 'Future',
  Active = 'Active',
  Review = 'Review',
  Expired = 'Expired',
}

enum SortingDirection {
  Ascending = 'ascending',
  Descending = 'descending',
}

type Props = {
  data: CourseTaskDto[];
  groupBy?: GroupType;
  onChange?: (id: number) => void;
  defaultValue?: number | null;
};

export function CourseTaskSelect(props: Props) {
  const { data, groupBy = Group.Default, onChange, defaultValue, ...options } = props;
  const selectProps = onChange ? { onChange } : {};
  const selectingGroup = getSelectingGroup(data, groupBy);

  return (
    <Form.Item
      {...options}
      name="courseTaskId"
      label="Task"
      initialValue={defaultValue}
      rules={[{ required: true, message: 'Please select a task' }]}
    >
      <Select placeholder="Select task" {...selectProps} showSearch optionFilterProp="label" listHeight={274}>
        {selectingGroup.map(
          (section, index) =>
            section.tasks.length > 0 && (
              <Select.OptGroup key={index} label={`${section.title} (${section.tasks.length})`}>
                {section.tasks.map(task => (
                  <Select.Option key={task.id} value={task.id} label={task.name}>
                    <span>
                      {section.title === Section.Active && groupBy === Group.Deadline && (
                        <DeadlineIcon group={groupBy} endDate={task.studentEndDate} />
                      )}
                      {section.title === Section.Review && groupBy === Group.CrossCheckDeadline && (
                        <DeadlineIcon group={groupBy} endDate={task.crossCheckEndDate} />
                      )}{' '}
                      {task.name}
                    </span>
                  </Select.Option>
                ))}
              </Select.OptGroup>
            ),
        )}
      </Select>
    </Form.Item>
  );
}

function getSelectingGroup(data: CourseTaskDto[], groupBy: GroupType) {
  switch (groupBy) {
    case Group.Deadline:
      return [
        {
          title: Section.Active,
          tasks: sortTasks({
            tasks: getTasksBetweenStudentStartDateStudentEndDate(data),
            sortBy: 'studentEndDate',
            sortingDirection: SortingDirection.Ascending,
          }),
        },
        {
          title: Section.Future,
          tasks: sortTasks({
            tasks: getTasksBeforeStudentStartDate(data),
            sortBy: 'studentStartDate',
            sortingDirection: SortingDirection.Ascending,
          }),
        },
        {
          title: Section.Expired,
          tasks: sortTasks({
            tasks: getTasksAfterStudentEndDate(data),
            sortBy: 'studentEndDate',
            sortingDirection: SortingDirection.Descending,
          }),
        },
      ];

    case Group.CrossCheckDeadline: {
      const unknownTasks = data.filter(({ crossCheckEndDate }) => !crossCheckEndDate);
      const tasksWithoutUnknown = data.filter(({ crossCheckEndDate }) => crossCheckEndDate);

      return [
        {
          title: Section.Review,
          tasks: sortTasks({
            tasks: getTasksBetweenStudentEndDateCrossCheckEndDate(tasksWithoutUnknown),
            sortBy: 'crossCheckEndDate',
            sortingDirection: SortingDirection.Ascending,
          }),
        },
        {
          title: Section.Unknown,
          tasks: sortTasks({
            tasks: unknownTasks,
            sortBy: 'studentEndDate',
            sortingDirection: SortingDirection.Ascending,
          }),
        },
        {
          title: Section.Future,
          tasks: sortTasks({
            tasks: getTasksBeforeStudentEndDate(tasksWithoutUnknown),
            sortBy: 'studentEndDate',
            sortingDirection: SortingDirection.Ascending,
          }),
        },
        {
          title: Section.Expired,
          tasks: sortTasks({
            tasks: getTasksAfterCrossCheckEndDate(tasksWithoutUnknown),
            sortBy: 'crossCheckEndDate',
            sortingDirection: SortingDirection.Descending,
          }),
        },
      ];
    }

    case Group.Default:
    default:
      return [
        {
          title: Section.AllTasks,
          tasks: sortTasks({
            tasks: data,
            sortBy: 'studentEndDate',
            sortingDirection: SortingDirection.Descending,
          }),
        },
      ];
  }
}

type SortTasksProps = {
  tasks: CourseTaskDto[];
  sortBy: 'studentStartDate' | 'studentEndDate' | 'crossCheckEndDate';
  sortingDirection: SortingDirection;
};

function sortTasks({ tasks, sortBy, sortingDirection }: SortTasksProps) {
  return [...tasks].sort((firstTask, secondTask) => {
    const firstDate = firstTask[sortBy];
    const secondDate = secondTask[sortBy];

    if (firstDate && secondDate) {
      return sortingDirection === SortingDirection.Ascending
        ? firstDate.localeCompare(secondDate)
        : secondDate.localeCompare(firstDate);
    }

    return 1;
  });
}

function getTasksBeforeStudentStartDate(tasks: CourseTaskDto[]) {
  return tasks.filter(task => Date.now() < Date.parse(task.studentStartDate));
}

function getTasksBeforeStudentEndDate(tasks: CourseTaskDto[]) {
  return tasks.filter(task => Date.now() < Date.parse(task.studentEndDate));
}

function getTasksAfterStudentEndDate(tasks: CourseTaskDto[]) {
  return tasks.filter(task => Date.now() >= Date.parse(task.studentEndDate));
}

function getTasksAfterCrossCheckEndDate(tasks: CourseTaskDto[]) {
  return tasks.filter(task => {
    if (task.crossCheckEndDate) {
      return Date.now() >= Date.parse(task.crossCheckEndDate);
    }
  });
}

function getTasksBetweenStudentStartDateStudentEndDate(tasks: CourseTaskDto[]) {
  return tasks.filter(
    task => Date.now() >= Date.parse(task.studentStartDate) && Date.now() < Date.parse(task.studentEndDate),
  );
}

function getTasksBetweenStudentEndDateCrossCheckEndDate(tasks: CourseTaskDto[]) {
  return tasks.filter(task => {
    if (task.crossCheckEndDate) {
      return Date.now() >= Date.parse(task.studentEndDate) && Date.now() < Date.parse(task.crossCheckEndDate);
    }
  });
}

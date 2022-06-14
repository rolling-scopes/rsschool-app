import { Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { CourseTaskDto } from 'api';
import { dateTimeRenderer } from 'components/Table';
import { ColumnTypeWithName, StudentScore } from 'services/course';

export function getTaskColumns(courseTasks: CourseTaskDto[]) {
  const columns = courseTasks.map(courseTask => {
    const column: ColumnTypeWithName<StudentScore> = {
      dataIndex: courseTask.id.toString(),
      title: () => {
        const icon = (
          <Popover
            content={
              <ul>
                <li>Coefficient: {courseTask.scoreWeight}</li>
                <li>Deadline: {dateTimeRenderer(courseTask.studentEndDate)}</li>
                <li>Max. score: {courseTask.maxScore}</li>
              </ul>
            }
            trigger="click"
          >
            <QuestionCircleOutlined title="Click for details" />
          </Popover>
        );
        return courseTask.descriptionUrl ? (
          <>
            <a className="table-header-link" target="_blank" href={courseTask.descriptionUrl}>
              {courseTask.name}
            </a>{' '}
            {icon}
          </>
        ) : (
          <div>
            {courseTask.name} {icon}
          </div>
        );
      },
      width: 100,
      className: 'align-right',
      render: (_, d) => {
        const currentTask = d.taskResults.find(taskResult => taskResult.courseTaskId === courseTask.id);
        return currentTask ? <div>{currentTask.score}</div> : 0;
      },
      name: courseTask.name,
    };
    return column;
  });
  return columns;
}

import { ColumnsType } from 'antd/lib/table';
import { CourseTaskDto, MentorReviewDto } from 'api';
import { GithubUserLink } from 'components/GithubUserLink';
import { dateTimeRenderer, getColumnSearchProps, renderTask, stringTrimRenderer } from 'components/Table';

const getSearchProps = (key: string) => ({
  ...getColumnSearchProps(key),
  onFilter: undefined,
});

export enum ColumnKey {
  TaskName = 'taskName',
  Student = 'student',
  SubmittedDate = 'submittedAt',
  SubmittedLink = 'solutionUrl',
  Checker = 'checker',
  ReviewedDate = 'reviewedAt',
  Score = 'score',
}

enum ColumnName {
  TaskName = 'Task Name',
  Student = 'Student',
  SubmittedDate = 'Submitted Date',
  SubmittedLink = 'Submitted Link',
  Checker = 'Checker',
  ReviewedDate = 'Reviewed Date',
  Score = 'Score',
}

export const getColumns = (tasks: CourseTaskDto[]): ColumnsType<MentorReviewDto> => [
  {
    key: ColumnKey.TaskName,
    title: ColumnName.TaskName,
    dataIndex: ColumnKey.TaskName,
    width: '15%',
    render: (taskName, review) => renderTask(taskName, review.taskDescriptionUrl),
    filters: tasks.map(task => ({ text: task.name, value: task.id })),
  },
  {
    key: ColumnKey.Student,
    title: ColumnName.Student,
    dataIndex: ColumnKey.Student,
    width: '15%',
    render: (_v, review) => <GithubUserLink value={review.student} />,
    ...getSearchProps(ColumnKey.Student),
  },
  {
    key: ColumnKey.SubmittedDate,
    title: ColumnName.SubmittedDate,
    dataIndex: ColumnKey.SubmittedDate,
    width: '15%',
    render: (_v, review) => dateTimeRenderer(review.submittedAt),
  },
  {
    key: ColumnKey.SubmittedLink,
    title: ColumnName.SubmittedLink,
    dataIndex: ColumnKey.SubmittedLink,
    width: '15%',
    render: solutionUrl => (
      <a target="_blank" href={solutionUrl}>
        {stringTrimRenderer(solutionUrl)}
      </a>
    ),
  },
  {
    key: ColumnKey.Checker,
    title: ColumnName.Checker,
    dataIndex: ColumnKey.Checker,
    width: '15%',
    render: checker => (checker ? <GithubUserLink value={checker} /> : null),
  },
  {
    key: ColumnKey.ReviewedDate,
    title: ColumnName.ReviewedDate,
    dataIndex: ColumnKey.ReviewedDate,
    width: '15%',
    render: (_v, review) => dateTimeRenderer(review.reviewedAt),
  },
  {
    key: ColumnKey.Score,
    title: ColumnName.Score,
    dataIndex: ColumnKey.Score,
    width: '10%',
    render: (_v, review) => (
      <>
        {review.score ?? 0} / {review.maxScore}
      </>
    ),
  },
];

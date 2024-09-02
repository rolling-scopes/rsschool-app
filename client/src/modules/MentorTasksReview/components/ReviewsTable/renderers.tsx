import Button from 'antd/lib/button';
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
  Actions = 'actions',
}

enum ColumnName {
  TaskName = 'Task Name',
  Student = 'Student',
  SubmittedDate = 'Submitted Date',
  SubmittedLink = 'Submitted Link',
  Checker = 'Checker',
  ReviewedDate = 'Reviewed Date',
  Score = 'Score',
  Actions = 'Actions',
}

export const getColumns = (
  tasks: CourseTaskDto[],
  handleClick: (review: MentorReviewDto) => void,
  isManager: boolean,
): ColumnsType<MentorReviewDto> => {
  const columns: ColumnsType<MentorReviewDto> = [
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
      width: '12.5%',
      render: (_v, review) => <GithubUserLink value={review.student} />,
      ...getSearchProps(ColumnKey.Student),
    },
    {
      key: ColumnKey.SubmittedDate,
      title: ColumnName.SubmittedDate,
      dataIndex: ColumnKey.SubmittedDate,
      width: '12.5%',
      sorter: true,
      render: (_v, review) => dateTimeRenderer(review.submittedAt),
    },
    {
      key: ColumnKey.SubmittedLink,
      title: ColumnName.SubmittedLink,
      dataIndex: ColumnKey.SubmittedLink,
      width: '12.5%',
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
      width: '12.5%',
      render: checker => (checker ? <GithubUserLink value={checker} /> : null),
    },
    {
      key: ColumnKey.ReviewedDate,
      title: ColumnName.ReviewedDate,
      dataIndex: ColumnKey.ReviewedDate,
      width: '12.5%',
      sorter: true,
      render: (_v, review) => dateTimeRenderer(review.reviewedAt),
    },
    {
      align: 'right',
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
    {
      align: 'center',
      key: ColumnKey.Actions,
      title: ColumnName.Actions,
      dataIndex: ColumnKey.Actions,
      width: '12.5%',
      render: (_v, review) => (
        <Button type="link" onClick={() => handleClick(review)} disabled={!!review.score}>
          Assign Reviewer
        </Button>
      ),
    },
  ];

  return isManager ? columns : columns.filter(column => column.key !== ColumnKey.Actions);
};

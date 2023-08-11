import { CrossCheckPairDto } from 'api';
import { ColumnType } from 'antd/lib/table/interface';
import { omit } from 'lodash';
import { dateTimeRenderer, getColumnSearchProps } from 'components/Table';
import { GithubAvatar } from 'components/GithubAvatar';
import { Button } from 'antd';

export const fields = {
  task: 'task',
  checker: 'checker',
  student: 'student',
  url: 'url',
  score: 'score',
  submittedDate: 'submittedDate',
  reviewedDate: 'reviewedDate',
};

export interface CustomColumnType<RecordType> extends ColumnType<RecordType> {
  sorterField?: string;
}

const renderGithubLink = (value: string) => (
  <div>
    {value ? (
      <>
        <GithubAvatar githubId={value} size={24} />
        &nbsp;
        <a target="_blank" rel="noopener noreferrer" href={`https://github.com/${value}`}>
          {value}
        </a>
      </>
    ) : null}
  </div>
);

export const getColumns = (viewComment: (value: CrossCheckPairDto) => void): CustomColumnType<CrossCheckPairDto>[] => [
  {
    title: 'Task',
    fixed: 'left',
    dataIndex: ['task', 'name'],
    key: fields.task,
    width: 100,
    sorter: true,
    sorterField: 'task',
    ...omit(getColumnSearchProps(['task', 'name']), 'onFilter'),
  },
  {
    title: 'Checker',
    fixed: 'left',
    key: fields.checker,
    dataIndex: ['checker', 'githubId'],
    sorter: true,
    sorterField: 'checker',
    width: 150,
    render: renderGithubLink,
    ...omit(getColumnSearchProps(['checkerStudent', 'githubId']), 'onFilter'),
  },
  {
    title: 'Student',
    key: fields.student,
    dataIndex: ['student', 'githubId'],
    sorter: true,
    sorterField: 'student',
    width: 150,
    render: renderGithubLink,
    ...omit(getColumnSearchProps(['student', 'githubId']), 'onFilter'),
  },
  {
    title: 'Url',
    dataIndex: 'url',
    key: fields.url,
    width: 150,
    sorter: true,
    sorterField: 'url',
    ...getColumnSearchProps('url'),
  },
  {
    title: 'Score',
    dataIndex: 'score',
    key: fields.score,
    width: 80,
    sorter: true,
    sorterField: 'score',
    render: value => <>{value ?? '(Empty)'}</>,
  },
  {
    title: 'Submitted Date',
    dataIndex: 'submittedDate',
    key: fields.submittedDate,
    width: 80,
    sorter: true,
    sorterField: 'submittedDate',
    render: dateTimeRenderer,
  },
  {
    title: 'Reviewed Date',
    dataIndex: 'reviewedDate',
    key: fields.reviewedDate,
    width: 80,
    sorter: true,
    sorterField: 'reviewedDate',
    render: (_, record) => dateTimeRenderer(record.reviewedDate),
  },
  {
    title: 'Comment',
    dataIndex: 'comment',
    key: 'comment',
    width: 60,
    render: (_, record) => (
      <Button disabled={!record.historicalScores} onClick={() => viewComment(record)} type="link" size="small">
        Show
      </Button>
    ),
  },
];

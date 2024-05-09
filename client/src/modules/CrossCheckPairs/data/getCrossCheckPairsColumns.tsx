import { CrossCheckPairDto } from 'api';
import { GithubFilled } from '@ant-design/icons';
import { ColumnType } from 'antd/lib/table/interface';
import { omit } from 'lodash';
import { dateTimeRenderer, getColumnSearchProps } from 'components/Table';
import { GithubAvatar } from 'components/GithubAvatar';
import { Button, Flex } from 'antd';

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

const renderGithubLink = (value: string) =>
  value ? (
    <div>
      <GithubAvatar githubId={value} size={24} />
      &nbsp;
      <a target="_blank" rel="noopener noreferrer" href={`https://github.com/${value}`}>
        {value}
      </a>
    </div>
  ) : null;

const renderPrivateRepositoryLink = (value?: string) =>
  value ? (
    <Flex>
      <a target="_blank" href={value}>
        <GithubFilled /> Private Repository
      </a>
    </Flex>
  ) : null;

export const getCrossCheckPairsColumns = (
  viewComment: (value: CrossCheckPairDto) => void,
): CustomColumnType<CrossCheckPairDto>[] => [
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
    title: 'Private Repository',
    dataIndex: 'privateRepository',
    key: 'privateRepository',
    width: 150,
    render: value => renderPrivateRepositoryLink(value),
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

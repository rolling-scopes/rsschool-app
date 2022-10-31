import { ColumnsType } from 'antd/lib/table';
import { StudentsTableColumnKey, StudentsTableColumnKName } from 'modules/Mentor/constants';
import { StudentsTableRow } from '.';
import { GithubUserLink } from 'components/GithubUserLink';
import { getColumnSearchProps } from 'components/Table';
import { Space, Typography } from 'antd';
import { SelectOutlined } from '@ant-design/icons';

const { Text, Link } = Typography;

export const columns: ColumnsType<StudentsTableRow> = [
  {
    key: StudentsTableColumnKey.Number,
    title: StudentsTableColumnKName.Number,
    render: (_v, _r, idx) => idx + 1,
    align: 'center',
  },
  {
    key: StudentsTableColumnKey.GithubId,
    title: StudentsTableColumnKName.GithubId,
    dataIndex: 'studentGithubId',
    render: (value: string) => !!value && <GithubUserLink value={value} />,
    ...getColumnSearchProps('studentGithubId'),
  },
  {
    key: StudentsTableColumnKey.Name,
    title: StudentsTableColumnKName.Name,
    dataIndex: 'studentName',
    render: renderName,
    ...getColumnSearchProps('studentName'),
  },
  {
    key: StudentsTableColumnKey.Task,
    title: StudentsTableColumnKName.Task,
    dataIndex: 'taskName',
    render: renderTask,
  },
  {
    key: StudentsTableColumnKey.GithubPrUrl,
    title: StudentsTableColumnKName.GithubPrUrl,
    dataIndex: 'githubPrUrl',
    render: renderTask,
  },
  // {
  //   key: StudentsTableColumnKey.DesiredDeadline,
  //   title: StudentsTableColumnKName.DesiredDeadline,
  //   // TODO: change to date when proper API&DTO will be added
  //   sorter: dateSorter('date'),
  // },
  {
    key: StudentsTableColumnKey.Score,
    title: StudentsTableColumnKName.Score,
    render: renderScore,
  },
  {
    key: StudentsTableColumnKey.SubmitScores,
    title: StudentsTableColumnKName.SubmitScores,
    render: renderSubmitButton,
  },
];

function renderName(value: string, row: StudentsTableRow) {
  if (!row.studentName) return value;

  return (
    <a target="_blank" href={row.studentName}>
      {value}
    </a>
  );
}

function renderTask(value: string, row: StudentsTableRow) {
  if (!row.taskDescriptionUrl) return value;

  return (
    <a target="_blank" href={row.taskDescriptionUrl}>
      {value}
    </a>
  );
}

function renderScore(_v: string, row: StudentsTableRow) {
  const { maxScore, resultScore } = row;
  if (maxScore == null) return null;

  return (
    <Text>
      {resultScore ?? '-'} / {maxScore}
    </Text>
  );
}

function renderSubmitButton() {
  // TODO: modal window to submit scores
  const courseAlias = ''; // TODO: course.alias
  return (
    <Link href={`/course/mentor/submit-review?${courseAlias}`}>
      <Space>
        SubmitReview <SelectOutlined rotate={90} />
      </Space>
    </Link>
  );
}

import { ColumnsType } from 'antd/lib/table';
import { StudentsTableColumnKey, StudentsTableColumnName } from 'modules/Mentor/constants';
import { GithubUserLink } from 'components/GithubUserLink';
import { getColumnSearchProps } from 'components/Table';
import { Space, Typography } from 'antd';
import { SelectOutlined } from '@ant-design/icons';
import { MentorDashboardDto, ProfileCourseDto } from 'api';

const { Text, Link } = Typography;

export const getColumns = (course: ProfileCourseDto): ColumnsType<MentorDashboardDto> => [
  {
    key: StudentsTableColumnKey.Number,
    title: StudentsTableColumnName.Number,
    render: (_v, _r, idx) => idx + 1,
    align: 'center',
  },
  {
    key: StudentsTableColumnKey.GithubId,
    title: StudentsTableColumnName.GithubId,
    dataIndex: 'studentGithubId',
    render: (value: string) => !!value && <GithubUserLink value={value} />,
    ...getColumnSearchProps('studentGithubId'),
  },
  {
    key: StudentsTableColumnKey.Name,
    title: StudentsTableColumnName.Name,
    dataIndex: 'studentName',
    render: renderName,
    ...getColumnSearchProps('studentName'),
  },
  {
    key: StudentsTableColumnKey.Task,
    title: StudentsTableColumnName.Task,
    dataIndex: 'taskName',
    render: renderTask,
  },
  {
    key: StudentsTableColumnKey.SolutionUrl,
    title: StudentsTableColumnName.SolutionUrl,
    dataIndex: 'solutionUrl',
    render: renderSolutionUrl,
  },
  {
    key: StudentsTableColumnKey.Score,
    title: StudentsTableColumnName.Score,
    render: renderScore,
  },
  {
    key: StudentsTableColumnKey.SubmitScores,
    title: StudentsTableColumnName.SubmitScores,
    render: () => renderSubmitButton(course),
  },
];

function renderName(value: string, row: MentorDashboardDto) {
  if (!row.studentName) return value;

  return (
    <Link target="_blank" href={`/profile?githubId=${row.studentGithubId}`}>
      {value}
    </Link>
  );
}

function renderTask(value: string, row: MentorDashboardDto) {
  if (!row.taskDescriptionUrl) return value;

  return (
    <Link target="_blank" href={row.taskDescriptionUrl}>
      {value}
    </Link>
  );
}

function renderSolutionUrl(value: string, row: MentorDashboardDto) {
  if (!row.solutionUrl) return value;

  return (
    <Link target="_blank" href={row.solutionUrl}>
      {value}
    </Link>
  );
}

function renderScore(_v: string, row: MentorDashboardDto) {
  const { maxScore, resultScore } = row;
  if (maxScore == null) return null;

  return (
    <Text>
      {resultScore ?? '-'} / {maxScore}
    </Text>
  );
}

function renderSubmitButton({ alias }: ProfileCourseDto) {
  // TODO: modal window to submit scores
  return (
    <Link target="_blank" href={`/course/mentor/submit-review?course=${alias}`}>
      <Space>
        SubmitReview <SelectOutlined rotate={90} />
      </Space>
    </Link>
  );
}

import { ColumnsType } from 'antd/lib/table';
import { Breakpoint } from 'antd/lib/_util/responsiveObserve';
import { TaskSolutionsTableColumnKey, TaskSolutionsTableColumnName } from 'modules/Mentor/constants';
import { dateSorter, dateWithTimeZoneRenderer, getColumnSearchProps } from 'components/Table';
import { Button, Space, Typography } from 'antd';
import { MentorDashboardDto } from 'api';
import moment from 'moment';

const { Text, Link } = Typography;

const FORMAT = 'YYYY-MM-DD HH:mm';
const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
const DISPLAY_TABLE_BREAKPOINTS: Breakpoint[] = ['sm'];
const DISPLAY_TABLE_MOBILE_BREAKPOINT: Breakpoint[] = ['xs'];

export const getColumns = (handleSubmitClick: (data: MentorDashboardDto) => void): ColumnsType<MentorDashboardDto> => [
  {
    key: TaskSolutionsTableColumnKey.Number,
    title: TaskSolutionsTableColumnName.Number,
    align: 'center',
    responsive: DISPLAY_TABLE_BREAKPOINTS,
    render: (_v, _r, idx) => idx + 1,
  },
  {
    key: TaskSolutionsTableColumnKey.Name,
    title: TaskSolutionsTableColumnName.Name,
    dataIndex: 'studentName',
    render: renderName,
    responsive: DISPLAY_TABLE_BREAKPOINTS,
    ...getColumnSearchProps('studentName'),
  },
  {
    key: TaskSolutionsTableColumnKey.Task,
    title: TaskSolutionsTableColumnName.Task,
    dataIndex: 'taskName',
    responsive: DISPLAY_TABLE_BREAKPOINTS,
    render: renderTask,
  },
  {
    key: TaskSolutionsTableColumnKey.SolutionUrl,
    title: TaskSolutionsTableColumnName.SolutionUrl,
    dataIndex: 'solutionUrl',
    responsive: DISPLAY_TABLE_BREAKPOINTS,
    render: renderSolutionUrl,
  },
  {
    key: TaskSolutionsTableColumnKey.DesiredDeadline,
    title: TaskSolutionsTableColumnName.DesiredDeadline,
    dataIndex: 'endDate',
    responsive: DISPLAY_TABLE_BREAKPOINTS,
    sortDirections: ['descend', 'ascend'],
    render: renderDate,
    sorter: dateSorter('endDate'),
  },
  {
    key: TaskSolutionsTableColumnKey.Score,
    title: TaskSolutionsTableColumnName.Score,
    responsive: DISPLAY_TABLE_BREAKPOINTS,
    align: 'right',
    render: renderScore,
  },
  {
    key: TaskSolutionsTableColumnKey.MobileTask,
    title: TaskSolutionsTableColumnName.MobileTask,
    responsive: DISPLAY_TABLE_MOBILE_BREAKPOINT,
    render: renderMobile,
  },
  {
    key: TaskSolutionsTableColumnKey.SubmitScores,
    title: TaskSolutionsTableColumnName.SubmitScores,
    align: 'center',
    render: row => renderSubmitButton(row, handleSubmitClick),
  },
];

function renderName(value: string, { studentName, studentGithubId }: MentorDashboardDto) {
  if (!studentName) return value;

  return (
    <Link target="_blank" href={`/profile?githubId=${studentGithubId}`}>
      {value}
    </Link>
  );
}

function renderTask(value: string, { taskDescriptionUrl }: MentorDashboardDto) {
  if (!taskDescriptionUrl) return value;

  return (
    <Link target="_blank" href={taskDescriptionUrl}>
      {value}
    </Link>
  );
}

function renderSolutionUrl(value: string, { solutionUrl }: MentorDashboardDto) {
  if (!solutionUrl) return value;

  return (
    <Link target="_blank" href={solutionUrl}>
      {value}
    </Link>
  );
}

function renderScore(_v: string, { maxScore, resultScore }: MentorDashboardDto) {
  if (!maxScore) return null;

  return (
    <Text>
      {resultScore ?? '-'} / {maxScore}
    </Text>
  );
}

function renderSubmitButton(row: MentorDashboardDto, handleSubmitClick: (d: MentorDashboardDto) => void) {
  return (
    <Button type="link" onClick={() => handleSubmitClick(row)}>
      Submit
    </Button>
  );
}

function renderMobile(row: MentorDashboardDto) {
  return (
    <Space direction="vertical">
      {renderName(row.studentName, row)}
      {renderTask(row.taskName, row)}
      {renderSolutionUrl(row.solutionUrl, row)}
      {renderDate(row.endDate, row)}
      {renderScore('', row)}
    </Space>
  );
}

function renderDate(value: string, { endDate, resultScore }: MentorDashboardDto) {
  const now = moment();
  const end = moment(endDate);
  const color = end.diff(now, 'hours') < 48 && !resultScore ? 'warning' : undefined;
  const text = dateWithTimeZoneRenderer(TIMEZONE, FORMAT)(value);

  return <Typography.Text type={color}>{text}</Typography.Text>;
}

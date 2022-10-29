import { ColumnsType } from 'antd/lib/table';
import { StudentsTableColumnKey, StudentsTableColumnKName } from 'modules/Mentor/constants';
import { StudentsTableRow } from '.';
import { GithubUserLink } from 'components/GithubUserLink';
import { dateSorter, getColumnSearchProps, scoreRenderer } from 'components/Table';

export const columns: ColumnsType<StudentsTableRow> = [
  {
    key: StudentsTableColumnKey.Number,
    title: StudentsTableColumnKName.Number,
    align: 'center',
  },
  {
    key: StudentsTableColumnKey.GithubId,
    title: StudentsTableColumnKName.GithubId,
    render: (value: string) => !!value && <GithubUserLink value={value} />,
    ...getColumnSearchProps('githubId'),
  },
  {
    key: StudentsTableColumnKey.Name,
    title: StudentsTableColumnKName.Name,
    render: renderName,
    ...getColumnSearchProps('name'),
  },
  {
    key: StudentsTableColumnKey.Task,
    title: StudentsTableColumnKName.Task,
    render: renderTask,
  },
  {
    key: StudentsTableColumnKey.DesiredDeadline,
    title: StudentsTableColumnKName.DesiredDeadline,
    // TODO: change to date when proper API&DTO will be added
    sorter: dateSorter('id'),
  },
  {
    key: StudentsTableColumnKey.Score,
    title: StudentsTableColumnKName.Score,
    render: scoreRenderer,
  },
  // TODO: display when functionality will be ready
  // {
  //   key: StudentsTableColumnKey.SubmitScores,
  //   title: StudentsTableColumnKName.SubmitScores,
  // },
];

function renderName(value: string, row: StudentsTableRow) {
  if (!row.repoUrl) return value;

  return (
    <a target="_blank" href={row.repoUrl}>
      {value}
    </a>
  );
}

function renderTask(value: string, row: StudentsTableRow) {
  // TODO: get descriptionUrl for Task
  if (!row.repoUrl) return value;

  return (
    <a target="_blank" href={row.repoUrl}>
      {value}
    </a>
  );
}

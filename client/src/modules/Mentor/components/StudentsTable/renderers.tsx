import { ColumnsType } from 'antd/lib/table';
import { StudentsTableColumnKey, StudentsTableColumnKName } from 'modules/Mentor/constants';
import { StudentsTableRow } from '.';
import { GithubUserLink } from 'components/GithubUserLink';
import { getColumnSearchProps, scoreRenderer } from 'components/Table';

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
    render: ({ studentGithubId }: StudentsTableRow) => !!studentGithubId && <GithubUserLink value={studentGithubId} />,
    ...getColumnSearchProps('studentGithubId'),
  },
  {
    key: StudentsTableColumnKey.Name,
    title: StudentsTableColumnKName.Name,
    render: renderName,
    ...getColumnSearchProps('studentName'),
  },
  // {
  //   key: StudentsTableColumnKey.Task,
  //   title: StudentsTableColumnKName.Task,
  //   render: renderTask,
  // },
  // {
  //   key: StudentsTableColumnKey.DesiredDeadline,
  //   title: StudentsTableColumnKName.DesiredDeadline,
  //   // TODO: change to date when proper API&DTO will be added
  //   sorter: dateSorter('id'),
  // },
  {
    key: StudentsTableColumnKey.Score,
    title: StudentsTableColumnKName.Score,
    render: scoreRenderer,
  },
  {
    key: StudentsTableColumnKey.SubmitScores,
    title: StudentsTableColumnKName.SubmitScores,
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

// function renderTask(value: string, row: StudentsTableRow) {
//   // TODO: get descriptionUrl for Task
//   if (!row.repoUrl) return value;

//   return (
//     <a target="_blank" href={row.repoUrl}>
//       {value}
//     </a>
//   );
// }

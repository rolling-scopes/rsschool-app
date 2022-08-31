import { Typography } from 'antd';
import { StudentBasic } from 'services/models';
import { StudentContacts } from './StudentContacts';

export type AssignmentLink = { student: StudentBasic; url: string };

export function CrossCheckAssignmentLink({ assignment }: { assignment?: AssignmentLink }) {
  if (!assignment) {
    return null;
  }

  const {
    student: { discord },
    url: solutionUrl,
  } = assignment;

  return (
    <div style={{ marginTop: 16 }}>
      <StudentContacts discord={discord} />
      <Typography.Paragraph style={{ marginTop: 14 }}>
        Solution:{' '}
        <Typography.Link target="_blank" href={solutionUrl}>
          {solutionUrl}
        </Typography.Link>
      </Typography.Paragraph>
    </div>
  );
}

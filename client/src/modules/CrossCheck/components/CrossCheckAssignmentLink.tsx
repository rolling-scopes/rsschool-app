import { Typography } from 'antd';
import { StudentBasic } from '@client/services/models';
import { StudentDiscord } from '@client/components/StudentDiscord';

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
      <StudentDiscord discord={discord} textPrefix="Student Discord:" />
      <Typography.Paragraph style={{ marginTop: 14 }}>
        Solution:{' '}
        <Typography.Link target="_blank" href={solutionUrl}>
          {solutionUrl}
        </Typography.Link>
      </Typography.Paragraph>
    </div>
  );
}

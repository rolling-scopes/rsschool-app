import { Typography } from 'antd';
import CopyToClipboardButton from 'components/CopyToClipboardButton';
import { StudentBasic } from 'services/models';

export type AssignmentLink = { student: StudentBasic; url: string };

export function CrossCheckAssignmentLink({ assignment }: { assignment?: AssignmentLink }) {
  if (!assignment) {
    return null;
  }
  const discordUsername = `@${assignment.student.discord}`;
  return (
    <div style={{ marginTop: 16 }}>
      <Typography.Paragraph>
        Student Discord:{' '}
        {assignment.student.discord ? (
          <>
            <Typography.Text strong>{discordUsername}</Typography.Text>{' '}
            <CopyToClipboardButton value={discordUsername} />
          </>
        ) : (
          'unknown'
        )}
      </Typography.Paragraph>
      <Typography.Paragraph>
        Solution: <a href={assignment.url}>{assignment.url}</a>
      </Typography.Paragraph>
    </div>
  );
}

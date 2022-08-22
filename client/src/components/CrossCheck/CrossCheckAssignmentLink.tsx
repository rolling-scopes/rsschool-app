import { Typography } from 'antd';
import CopyToClipboardButton from 'components/CopyToClipboardButton';
import { StudentBasic } from 'services/models';

export type AssignmentLink = { student: StudentBasic; url: string };

export function CrossCheckAssignmentLink({ assignment }: { assignment?: AssignmentLink }) {
  if (!assignment) {
    return null;
  }

  const {
    student: { discord },
    url: solutionUrl,
  } = assignment;

  const discordUsername = discord ? `@${discord.username}#${discord.discriminator}` : null;

  return (
    <div style={{ marginTop: 16 }}>
      <Typography.Paragraph>
        Student Discord:{' '}
        {discordUsername ? (
          <>
            <Typography.Link target="_blank" href={`https://discordapp.com/users/${discord?.id}`}>
              {discordUsername}
            </Typography.Link>{' '}
            <CopyToClipboardButton value={discordUsername} />
          </>
        ) : (
          'unknown'
        )}
      </Typography.Paragraph>
      <Typography.Paragraph>
        Solution:{' '}
        <Typography.Link target="_blank" href={solutionUrl}>
          {solutionUrl}
        </Typography.Link>
      </Typography.Paragraph>
    </div>
  );
}

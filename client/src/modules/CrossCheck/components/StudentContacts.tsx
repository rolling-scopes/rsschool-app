import { Typography } from 'antd';
import { Discord } from 'api';
import CopyToClipboardButton from 'components/CopyToClipboardButton';

type Props = {
  discord: Discord | null;
};

export function StudentContacts({ discord }: Props) {
  const discordUsername = discord ? `@${discord.username}#${discord.discriminator}` : null;

  return (
    <Typography.Paragraph style={{ margin: 0 }}>
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
  );
}

import { Typography } from 'antd';
import { Discord } from 'api';
import CopyToClipboardButton from 'components/CopyToClipboardButton';

type Props = {
  discord: Discord | null;
  textPrefix?: string;
};

export function StudentDiscord({ discord, textPrefix }: Props) {
  const discordDiscriminator = discord?.discriminator !== '0' ? `#${discord?.discriminator}` : '';
  const discordUsername = discord ? `@${discord.username}${discordDiscriminator}` : null;

  return (
    <Typography.Paragraph style={{ margin: 0 }}>
      {textPrefix && `${textPrefix} `}
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

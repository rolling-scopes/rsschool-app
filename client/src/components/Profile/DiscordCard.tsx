import * as React from 'react';
import { Typography } from 'antd';
import { CheckSquareTwoTone, WarningTwoTone } from '@ant-design/icons';
import { Discord } from 'common/models/profile';
import discordIntegration from '../../configs/discord-integration';
import CopyToClipboardButton from '../CopyToClipboardButton';
import { DiscordOutlined } from 'components/Icons/DiscordOutlined';
import CommonCard from './CommonCard';

const { Paragraph, Text } = Typography;

type Props = {
  data: Discord | null;
  isProfileOwner: boolean;
};

class DiscordCard extends React.Component<Props> {
  render() {
    const { data, isProfileOwner } = this.props;
    const { id, username, discriminator } = data ?? {};

    const authorizedAsMessage = isProfileOwner ? 'You are authorized as' : 'The user is authorized as';
    const notAuthorizedMessage = isProfileOwner ? `You haven't authorized yet` : `The user hasn't authorized yet`;
    const discordUsername = `@${username}#${discriminator}`;

    return (
      <CommonCard
        title="Discord Integration"
        icon={<DiscordOutlined />}
        content={
          <>
            <Paragraph>
              {id ? (
                <>
                  {authorizedAsMessage}:
                  <br />
                  <CheckSquareTwoTone twoToneColor="#52c41a" /> <Text strong>{discordUsername}</Text>{' '}
                  <CopyToClipboardButton value={discordUsername} />
                </>
              ) : (
                <>
                  <WarningTwoTone twoToneColor="#ff4d4f" /> {notAuthorizedMessage}
                </>
              )}
            </Paragraph>
            {isProfileOwner && (
              <Paragraph>
                {id && 'Switch to another Discord account:'}
                <br />
                <a href={discordIntegration.api.auth}>{id ? 'Reauthorize' : 'Authorize'}</a>
              </Paragraph>
            )}
          </>
        }
      />
    );
  }
}

export default DiscordCard;

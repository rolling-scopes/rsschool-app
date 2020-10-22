import * as React from 'react';
import { Typography } from 'antd';
import CommonCard from './CommonCard';
import { Discord } from '../../../../common/models/profile';
import { CheckSquareTwoTone, WarningTwoTone } from '@ant-design/icons';
import discordIntegration from '../../configs/discord-integration';
import CopyToClipboardButton from '../CopyToClipboardButton';

const { Paragraph, Text } = Typography;

import { RobotFilled } from '@ant-design/icons';

type Props = {
  data: Discord | null;
  isProfileOwner: boolean;
};

class DiscordCard extends React.Component<Props> {
  render() {
    const { data, isProfileOwner } = this.props;
    const { id, username, discriminator } = data ?? {};

    const authorizedAsMessage = isProfileOwner ? 'You authorized as' : 'User authorized as';
    const notAuthorizedMessage = isProfileOwner ? `You were'nt authorized yet` : `User was'nt authorized yet`;
    const discordUsername = `@${username}#${discriminator}`;

    return (
      <CommonCard
        title="Discord Integration"
        icon={<RobotFilled />}
        content={
          <>
            <Paragraph>
              {id ? (
                <>
                  {authorizedAsMessage}
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
                {id && 'Is this the wrong profile?'}
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

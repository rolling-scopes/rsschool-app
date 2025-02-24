import { Typography } from 'antd';
import { WarningTwoTone } from '@ant-design/icons';
import { Discord } from '@common/models/profile';
import discordIntegration from '../../configs/discord-integration';
import { DiscordOutlined } from 'components/Icons/DiscordOutlined';
import CommonCard from './CommonCard';
import { StudentDiscord } from 'components/StudentDiscord';

const { Paragraph } = Typography;

type Props = {
  data: Discord | null;
  isProfileOwner: boolean;
};

const DiscordCard: React.FC<Props> = ({ data, isProfileOwner }) => {
  const authorizedAsMessage = isProfileOwner ? 'You are authorized as' : 'The user is authorized as';
  const notAuthorizedMessage = isProfileOwner ? `You haven't authorized yet` : `The user hasn't authorized yet`;

  return (
    <CommonCard
      title="Discord Integration"
      icon={<DiscordOutlined />}
      content={
        <>
          <Paragraph>
            {data?.id ? (
              <>
                {authorizedAsMessage}:
                <br />
                <StudentDiscord discord={data} />
              </>
            ) : (
              <>
                <WarningTwoTone twoToneColor="#ff4d4f" /> {notAuthorizedMessage}
              </>
            )}
          </Paragraph>
          {isProfileOwner && (
            <Paragraph>
              {data?.id && 'Switch to another Discord account:'}
              <br />
              <a href={discordIntegration.api.auth}>{data?.id ? 'Reauthorize' : 'Authorize'}</a>
            </Paragraph>
          )}
        </>
      }
    />
  );
};

export default DiscordCard;

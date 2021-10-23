import * as React from 'react';
import { Consent } from 'common/models/profile';
import CommonCard from './CommonCard';
import { NotificationOutlined, CloseSquareTwoTone, CheckSquareTwoTone } from '@ant-design/icons';
import { List, Typography, Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

const { Text } = Typography;

const rsschoolBotLink = 'https://t.me/rsschool_bot?start';

type Props = {
  data: Consent[];
  isEditingModeEnabled: boolean;
  onProfileSettingsChange: (event: any, path: string) => void;
};

type State = {
  tgOptIn: boolean;
  isTgConsentExist: boolean;
};

class ConsentsCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { data } = props;
    const [tgConsent] = data.filter(consent => consent.channelType === 'tg');
    this.state = {
      tgOptIn: tgConsent && tgConsent.optIn,
      isTgConsentExist: Boolean(tgConsent),
    };
  }

  private onConsentChanged = (e: CheckboxChangeEvent) => {
    const { id, checked } = e.target;
    if (id === 'tg') {
      this.setState({ tgOptIn: checked });
    }
    this.props.onProfileSettingsChange(e.target, 'consent');
  };

  render() {
    const { tgOptIn, isTgConsentExist } = this.state;
    const { isEditingModeEnabled } = this.props;

    const listItems: any[] = [
      <List.Item>
        <Text>Telegram notifications</Text>
        {tgOptIn ? <CheckSquareTwoTone twoToneColor="#52c41a" /> : <CloseSquareTwoTone twoToneColor="#ff4d4f" />}
      </List.Item>,
    ];

    const settingsListItems: any[] = [
      <List.Item
        style={{ borderBottom: 'none' }}
        title={`You ${tgOptIn ? 'are' : "aren't"} subscribed to telegram notifications`}
      >
        <label htmlFor={'tg'}>Telegram notifications</label>
        <Checkbox id={'tg'} disabled={!isTgConsentExist} checked={tgOptIn} onChange={this.onConsentChanged} />
      </List.Item>,
      !isTgConsentExist ? (
        <p style={{ fontSize: '11px', maxWidth: '85%', color: 'gray', marginTop: '-12px' }}>
          Note: To enable telegram notifications please open the{' '}
          <a target="_blank" href={rsschoolBotLink}>
            @rsschool_bot
          </a>{' '}
          and click the <b>Start</b> button
        </p>
      ) : (
        <></>
      ),
    ];

    return (
      <CommonCard
        title="Subscriptions"
        settingsTitle="Edit subscriptions"
        icon={<NotificationOutlined />}
        content={
          <List itemLayout="horizontal" dataSource={listItems} renderItem={listItemContent => listItemContent} />
        }
        noDataDescrption="Subscriptions not found"
        isEditingModeEnabled={isEditingModeEnabled}
        profileSettingsContent={
          <List
            itemLayout="horizontal"
            dataSource={settingsListItems}
            renderItem={listItemContent => listItemContent}
          />
        }
      />
    );
  }
}
export default ConsentsCard;

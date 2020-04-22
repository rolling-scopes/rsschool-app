import * as React from 'react';
import { Consent } from '../../../../common/models/profile';
import CommonCard from './CommonCard';
import { NotificationOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { List, Typography, Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

const { Text } = Typography;

type Props = {
  data: Consent[];
  isEditingModeEnabled: boolean;
  onProfileSettingsChange: (event: any, path: string) => void;
};

type State = {
  emailOptIn: boolean;
  tgOptIn: boolean;
  isTgConsentExist: boolean;
};

class ConsentsCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { data } = props;
    const [emailConsent] = data.filter(consent => consent.channelType === 'email');
    const [tgConsent] = data.filter(consent => consent.channelType === 'tg');
    this.state = {
      emailOptIn: emailConsent && emailConsent.optIn,
      tgOptIn: tgConsent && tgConsent.optIn,
      isTgConsentExist: Boolean(tgConsent),
    };
  }

  private onConsentChanged = (e: CheckboxChangeEvent) => {
    const { id, checked } = e.target;
    switch (id) {
      case 'tg':
        this.setState({ tgOptIn: checked });
        break;
      case 'email':
        this.setState({ emailOptIn: checked });
        break;
    }
    this.props.onProfileSettingsChange(e.target, 'consent');
  };

  render() {
    const { emailOptIn, tgOptIn, isTgConsentExist } = this.state;
    const { isEditingModeEnabled } = this.props;

    const listItems: any[] = [
      <List.Item>
        <Text>Receive E-Mail notifications</Text>
        {emailOptIn ? <CheckOutlined /> : <CloseOutlined />}
      </List.Item>,
      <List.Item>
        <Text>Receive Telegram notifications</Text>
        {tgOptIn ? <CheckOutlined /> : <CloseOutlined />}
      </List.Item>,
    ];

    const settingsListItems: any[] = [
      <List.Item>
        {emailOptIn ? (
          <label htmlFor={'email'}>Unsubscribe from E-Mail notifications</label>
        ) : (
          <label htmlFor={'email'}>Subscribe to E-Mail notifications</label>
        )}
        <Checkbox id={'email'} checked={emailOptIn} onChange={this.onConsentChanged} />
      </List.Item>,
      <List.Item>
        {tgOptIn ? (
          <label htmlFor={'tg'}>Unsubscribe from Telegram notifications</label>
        ) : (
          <label htmlFor={'tg'}>Subscribe to Telegram notifications</label>
        )}
        <Checkbox id={'tg'} disabled={!isTgConsentExist} checked={tgOptIn} onChange={this.onConsentChanged} />
      </List.Item>,
      !isTgConsentExist ? (
        <List.Item>
          Note: you must start a conversation with the{' '}
          <Text code={true} copyable={true}>
            @rsschool_bot
          </Text>{' '}
          in order to change telegram consent
        </List.Item>
      ) : (
        <></>
      ),
    ];

    return (
      <CommonCard
        title="Consents"
        icon={<NotificationOutlined />}
        content={
          <List itemLayout="horizontal" dataSource={listItems} renderItem={listItemContent => listItemContent} />
        }
        noDataDescrption="Consents not found"
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

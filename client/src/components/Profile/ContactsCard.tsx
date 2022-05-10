import * as React from 'react';
import isEqual from 'lodash/isEqual';
import { List, Typography, Input, Form } from 'antd';
import CommonCard from './CommonCard';
import { Contacts } from 'common/models/profile';
import { ConfigurableProfilePermissions } from 'common/models/profile';
import { ChangedPermissionsSettings } from 'pages/profile';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

const { Text } = Typography;

import { ContactsOutlined } from '@ant-design/icons';
import { NotificationChannel } from 'modules/Notifications/services/notifications';
import { EmailConfirmation } from './EmailConfirmation';
import { Rule } from 'antd/lib/form';

type ProfileEntryChangeCallback = (event: { target: { value: string } }, path: string) => void;

type Props = {
  data: Contacts;
  initialContacts?: Contacts;
  isEditingModeEnabled: boolean;
  permissionsSettings?: ConfigurableProfilePermissions;
  onPermissionsSettingsChange: (event: CheckboxChangeEvent, settings: ChangedPermissionsSettings) => void;
  onProfileSettingsChange: ProfileEntryChangeCallback;
  isDataPendingSave: boolean;
  connections: Partial<
    Record<
      NotificationChannel,
      | {
          value: string;
          enabled: boolean;
          lastLinkSentAt?: string;
        }
      | undefined
    >
  >;
  sendConfirmationEmail: () => void;
};

type Contact = { name: string; value: string | null; key: string; rules?: Rule[] };

class ContactsCard extends React.Component<Props> {
  state = {
    data: null,
  };

  private filterPermissions = ({
    isEmailVisible,
    isTelegramVisible,
    isPhoneVisible,
    isSkypeVisible,
    isContactsNotesVisible,
    isLinkedInVisible,
  }: Partial<ConfigurableProfilePermissions>) => ({
    isEmailVisible,
    isTelegramVisible,
    isPhoneVisible,
    isSkypeVisible,
    isContactsNotesVisible,
    isLinkedInVisible,
  });

  shouldComponentUpdate = (nextProps: Props) => {
    const {
      isEmailVisible,
      isTelegramVisible,
      isPhoneVisible,
      isSkypeVisible,
      isContactsNotesVisible,
      isLinkedInVisible,
    } = this.props.permissionsSettings!;

    return (
      !isEqual(nextProps.data, this.props.data) ||
      !isEqual(nextProps.permissionsSettings?.isEmailVisible, isEmailVisible) ||
      !isEqual(nextProps.permissionsSettings?.isTelegramVisible, isTelegramVisible) ||
      !isEqual(nextProps.permissionsSettings?.isPhoneVisible, isPhoneVisible) ||
      !isEqual(nextProps.permissionsSettings?.isSkypeVisible, isSkypeVisible) ||
      !isEqual(nextProps.permissionsSettings?.isContactsNotesVisible, isContactsNotesVisible) ||
      !isEqual(nextProps.permissionsSettings?.isLinkedInVisible, isLinkedInVisible) ||
      !isEqual(nextProps.isEditingModeEnabled, this.props.isEditingModeEnabled) ||
      !isEqual(nextProps.connections, this.props.connections) ||
      nextProps.isDataPendingSave !== this.props.isDataPendingSave
    );
  };

  render() {
    const {
      isEditingModeEnabled,
      permissionsSettings,
      onPermissionsSettingsChange,
      onProfileSettingsChange,
      connections,
      sendConfirmationEmail,
      isDataPendingSave,
      initialContacts,
    } = this.props;
    const { email, epamEmail, telegram, phone, skype, notes, linkedIn } = this.props.data;
    const contacts: Contact[] = [
      {
        name: 'EPAM E-mail',
        value: epamEmail,
        key: 'epamEmail',
        rules: [{ type: 'email', message: 'Email is not valid' }],
      },
      {
        name: 'E-mail',
        value: email,
        key: 'email',
        rules: [{ type: 'email', message: 'Email is not valid' }],
      },
      {
        name: 'Telegram',
        value: telegram,
        key: 'telegram',
      },
      {
        name: 'Phone',
        value: phone,
        key: 'phone',
      },
      {
        name: 'Skype',
        value: skype,
        key: 'skype',
      },
      {
        name: 'Notes',
        value: notes,
        key: 'notes',
      },
      {
        name: 'LinkedIn',
        value: linkedIn,
        key: 'linkedIn',
      },
    ];

    const filledContacts = contacts.filter(({ value }: Contact) => value);

    return (
      <CommonCard
        title="Contacts"
        icon={<ContactsOutlined />}
        content={
          filledContacts.length ? (
            <List
              itemLayout="horizontal"
              dataSource={filledContacts}
              renderItem={({ name, value, key }: Contact) => (
                <List.Item>
                  <Text strong>{name}:</Text>{' '}
                  {key !== 'linkedIn' ? (
                    <>
                      {value}
                      {key === 'email' && !isDataPendingSave && (!connections.email || !connections.email.enabled) ? (
                        <EmailConfirmation
                          connection={connections.email}
                          sendConfirmationEmail={sendConfirmationEmail}
                        />
                      ) : null}
                    </>
                  ) : (
                    <a target="__blank" href={value!}>
                      {value}
                    </a>
                  )}
                </List.Item>
              )}
            />
          ) : undefined
        }
        noDataDescrption="Contacts aren't filled in"
        permissionsSettings={permissionsSettings ? this.filterPermissions(permissionsSettings) : undefined}
        isEditingModeEnabled={isEditingModeEnabled}
        onPermissionsSettingsChange={onPermissionsSettingsChange}
        detachSettingsOnVisibilityChange
        profileSettingsContent={
          <EditForm
            contacts={contacts}
            onProfileSettingsChange={onProfileSettingsChange}
            initialContacts={initialContacts}
          />
        }
      />
    );
  }
}

export default ContactsCard;

function EditForm({
  contacts,
  onProfileSettingsChange,
  initialContacts,
}: {
  contacts: Contact[];
  initialContacts?: Contacts;
  onProfileSettingsChange: ProfileEntryChangeCallback;
}) {
  const [form] = Form.useForm();
  return (
    <Form
      form={form}
      onValuesChange={(changedValues: Record<string, string>) => {
        function notifyChanges(errors?: { errorFields: { errors: string[]; name: string[] }[] }) {
          Object.entries(changedValues).forEach(([key, value]: [string, string]) => {
            const path = `contacts.${key}`;
            if (!errors || errors.errorFields.every(field => !field.name.includes(key))) {
              onProfileSettingsChange({ target: { value } }, path);
            } else if (initialContacts) {
              onProfileSettingsChange(
                { target: { value: (initialContacts as unknown as Record<string, string>)[key] ?? '' } },
                path,
              );
            }
          });
        }
        form
          .validateFields()
          .then(() => notifyChanges())
          .catch(errors => notifyChanges(errors));
      }}
      initialValues={Object.fromEntries(contacts.map(c => [c.key, c.value]))}
    >
      <List<Contact>
        itemLayout="horizontal"
        dataSource={contacts}
        renderItem={({ name, key, rules }: Contact) => (
          <List.Item>
            <div style={{ width: '100%' }}>
              <p style={{ fontSize: 18, marginBottom: 5 }}>
                <Text strong>{name}:</Text>
              </p>
              <Form.Item rules={rules} name={key}>
                <Input style={{ width: '100%' }} />
              </Form.Item>
            </div>
          </List.Item>
        )}
      />
    </Form>
  );
}

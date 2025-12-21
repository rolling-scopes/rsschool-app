import { Form, Input, Select, Checkbox, Tabs } from 'antd';
import { NotificationDto, NotificationType } from 'api';
import { ModalForm } from 'components/Forms';
import React from 'react';
import { NotificationTemlate } from '../services/notifications';
import styles from './NotificationSettingsModal.module.css';

const { TabPane } = Tabs;
const { TextArea } = Input;

type Props = {
  notification?: NotificationDto;
  onCancel: () => void;
  onOk: (notification: NotificationDto) => void;
  notifications: Pick<NotificationDto, 'id' | 'name'>[];
};

export function NotificationSettingsModal(props: Props) {
  const {
    notification = {
      enabled: false,
    } as NotificationDto,
    onCancel,
    onOk,
    notifications = [],
  } = props;

  const initialValue = {
    ...notification,
    channels: defaultChannels.map(channel => {
      const existing = notification.channels?.find(existing => channel.channelId === existing.channelId);
      return {
        ...channel,
        ...existing,
      };
    }),
  };
  const { channels } = initialValue;
  const parentNotifications = [
    { id: undefined, name: 'Empty' },
    ...notifications.filter(n => n.id !== notification.id),
  ];

  return (
    <ModalForm title="Notification Settings" data={initialValue} submit={handleSubmit} cancel={onCancel}>
      <div className={styles.tabs}>
        <Tabs>
          <TabPane tab="Settings" forceRender destroyInactiveTabPane={false} key="sd">
            <Form.Item name="id" label="Id" rules={[{ required: true, message: 'Please enter id' }]}>
              <Input disabled={!!notification.id} />
            </Form.Item>

            <Form.Item name="name" rules={[{ required: true, message: 'Please enter name' }]} label="Name">
              <Input />
            </Form.Item>
            <Form.Item name="enabled" valuePropName="checked">
              <Checkbox>Active</Checkbox>
            </Form.Item>
            <Form.Item name="type" rules={[{ required: true, message: 'Please select type' }]} label="Type">
              <Select placeholder="Please select type">
                {Object.values(NotificationType).map(type => (
                  <Select.Option key={type} value={type}>
                    {type}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            {notifications.length > 1 && (
              <Form.Item name="parentId" label="Parent">
                <Select placeholder="Please select parent">
                  {parentNotifications.map(({ id, name }) => (
                    <Select.Option key={id} value={id}>
                      {name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </TabPane>
          {channels.map((channel, index) => (
            <TabPane tab={channel.channelId} key={channel.channelId} forceRender>
              <Form.Item hidden label={channel.channelId} name={['channels', index, 'channelId']}>
                <Input></Input>
              </Form.Item>
              {channel.channelId === 'email' && (
                <Form.Item label="subject" name={['channels', index, 'template', 'subject']}>
                  <Input />
                </Form.Item>
              )}
              <Form.Item label="body" name={['channels', index, 'template', 'body']}>
                <TextArea rows={20} />
              </Form.Item>
            </TabPane>
          ))}
        </Tabs>
      </div>
    </ModalForm>
  );

  function handleSubmit(notification: NotificationDto) {
    onOk(notification);
  }
}
const defaultChannels = [{ channelId: 'email' }, { channelId: 'telegram' }, { channelId: 'discord' }] as {
  channelId: string;
  template?: NotificationTemlate;
}[];

import { Form, Input, Select } from 'antd';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import TextArea from 'antd/lib/input/TextArea';
import { NotificationDto, NotificationType } from 'api';
import { ModalForm } from 'components/Forms';
import React from 'react';
import { NotificationTemlate } from '../services/notifications';
import { Tabs } from 'antd';

const { TabPane } = Tabs;

type Props = {
  notification?: NotificationDto;
  onCancel: () => void;
  onOk: (notification: NotificationDto) => void;
};

export function NotificationSettingsModal(props: Props) {
  const {
    notification = {
      enabled: false,
    } as NotificationDto,
    onCancel,
    onOk,
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

  return (
    <ModalForm title="Notification Settings" data={initialValue} submit={handleSubmit} cancel={onCancel}>
      <div className="tabs">
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
      <style jsx>{`
        .tabs :global(.ant-tabs-tab-btn) {
          text-transform: capitalize;
        }
      `}</style>
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

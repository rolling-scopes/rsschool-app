import { Alert, Form, Input, Space, Typography } from 'antd';
import { ERROR_MESSAGES, LABELS, PLACEHOLDERS, RSSCHOOL_BOT_LINK } from 'modules/Registry/constants';
import { emailPattern, phonePattern } from 'services/validators';
import { FormButtons, FormCard } from 'modules/Registry/components';

const { Title, Text } = Typography;

const CardTitle = (
  <Space direction="vertical" size={0}>
    <Title level={5}>Contact information</Title>
    <Text type="secondary" style={{ whiteSpace: 'normal' }}>
      Information will be shown to students so they can contact you. Indicate only the data that you're willing to share
    </Text>
  </Space>
);

export function ContactInfo() {
  return (
    <FormCard title={CardTitle}>
      <Form.Item
        label={LABELS.telegram}
        name="contactsTelegram"
        extra={
          <Alert
            style={{ marginTop: 12 }}
            type="info"
            message={
              <span>
                Subscribe to our{' '}
                <a href={RSSCHOOL_BOT_LINK} target="_blank">
                  Telegram-bot
                </a>{' '}
                to keep in touch with us.
              </span>
            }
          />
        }
      >
        <Input placeholder={PLACEHOLDERS.telegram} />
      </Form.Item>
      <Form.Item label={LABELS.skype} name="contactsSkype">
        <Input placeholder={PLACEHOLDERS.skype} />
      </Form.Item>
      <Form.Item label={LABELS.whatsApp} name="contactsWhatsApp">
        <Input placeholder={PLACEHOLDERS.whatsApp} />
      </Form.Item>
      <Form.Item
        label={LABELS.email}
        name="contactsEmail"
        rules={[{ pattern: emailPattern, message: ERROR_MESSAGES.email }]}
      >
        <Input placeholder={PLACEHOLDERS.email} />
      </Form.Item>
      <Form.Item
        label={LABELS.phone}
        name="contactsPhone"
        rules={[{ pattern: phonePattern, message: ERROR_MESSAGES.phone }]}
      >
        <Input placeholder={PLACEHOLDERS.phone} />
      </Form.Item>
      <Form.Item label={LABELS.notes} name="contactsNotes">
        <Input.TextArea rows={4} placeholder={PLACEHOLDERS.notes} />
      </Form.Item>
      <FormButtons submitTitle="Continue" />
    </FormCard>
  );
}

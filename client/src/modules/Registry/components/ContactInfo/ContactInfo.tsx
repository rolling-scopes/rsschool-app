import { Alert, Button, Form, Input, Typography } from 'antd';
import { ERROR_MESSAGES, LABELS, PLACEHOLDERS, RSSCHOOL_BOT_LINK } from 'modules/Registry/constants';
import { emailPattern, phonePattern } from 'services/validators';
import { FormCard } from 'modules/Registry/components';

const { Title, Paragraph } = Typography;

const CardTitle = (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <Title
      level={5}
      style={{
        marginBottom: '8px',
        color: 'rgba(0, 0, 0, 0.85)',
      }}
    >
      Contact information
    </Title>
    <Paragraph
      style={{
        marginBottom: 0,
        color: 'rgba(0, 0, 0, 0.45)',
      }}
    >
      Information will be shown to students so they can contact you. Indicate only the data that you're willing to share
    </Paragraph>
  </div>
);

export function ContactInfo() {
  return (
    <FormCard title={CardTitle}>
      <Form.Item label={LABELS.telegram} labelAlign="right" name="contactsTelegram" style={{ marginBottom: 0 }}>
        <Input placeholder={PLACEHOLDERS.telegram} />
      </Form.Item>
      <Form.Item>
        <Paragraph style={{ margin: '12px 0 0 0' }}>
          <Alert
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
        </Paragraph>
      </Form.Item>
      <Form.Item label={LABELS.skype} labelAlign="right" name="contactsSkype">
        <Input placeholder={PLACEHOLDERS.skype} />
      </Form.Item>
      <Form.Item label={LABELS.whatsApp} labelAlign="right" name="contactsWhatsApp">
        <Input placeholder={PLACEHOLDERS.whatsApp} />
      </Form.Item>
      <Form.Item
        label={LABELS.email}
        labelAlign="right"
        name="contactsEmail"
        rules={[{ pattern: emailPattern, message: ERROR_MESSAGES.email }]}
      >
        <Input placeholder={PLACEHOLDERS.email} />
      </Form.Item>
      <Form.Item
        label={LABELS.phone}
        labelAlign="right"
        name="contactsPhone"
        rules={[{ pattern: phonePattern, message: ERROR_MESSAGES.phone }]}
      >
        <Input placeholder={PLACEHOLDERS.phone} />
      </Form.Item>
      <Form.Item label={LABELS.notes} labelAlign="right" name="contactsNotes">
        <Input.TextArea rows={4} placeholder={PLACEHOLDERS.notes} />
      </Form.Item>
      <Form.Item className="buttons">
        <Button size="large" type="primary" htmlType="submit">
          Continue
        </Button>
      </Form.Item>
    </FormCard>
  );
}

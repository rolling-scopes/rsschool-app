import { Form, Input, Typography } from 'antd';
import { Dispatch, SetStateAction } from 'react';
import { Location } from 'common/models';
import { FormCard } from 'modules/Registry/components';
import { emailPattern, englishNamePattern, epamEmailPattern } from 'services/validators';
import { ERROR_MESSAGES, EXTRAS, LABELS, PLACEHOLDERS, TOOLTIPS } from 'modules/Registry/constants';
import { LocationSelect } from 'components/Forms';

type Props = {
  location: Location | null;
  setLocation: Dispatch<SetStateAction<Location | null>>;
};

const { Title } = Typography;

export function PersonalInfo({ location, setLocation }: Props) {
  return (
    <FormCard title={<Title level={5}>Personal information</Title>}>
      <Form.Item
        label={LABELS.firstName}
        name="firstName"
        rules={[{ required: true, pattern: englishNamePattern, message: ERROR_MESSAGES.inEnglish('First name') }]}
        extra={EXTRAS.inEnglish}
      >
        <Input placeholder={PLACEHOLDERS.firstName} />
      </Form.Item>
      <Form.Item
        label={LABELS.lastName}
        name="lastName"
        rules={[{ pattern: englishNamePattern, message: ERROR_MESSAGES.inEnglish('Last name') }]}
      >
        <Input placeholder={PLACEHOLDERS.lastName} />
      </Form.Item>
      <Form.Item
        label={LABELS.location}
        tooltip={TOOLTIPS.locationMentor}
        name="location"
        rules={[{ required: true, message: ERROR_MESSAGES.location }]}
        valuePropName={'location'}
      >
        <LocationSelect onChange={setLocation} location={location} />
      </Form.Item>
      <Form.Item
        label={LABELS.primaryEmail}
        tooltip={TOOLTIPS.primaryEmail}
        name="primaryEmail"
        rules={[{ required: true, pattern: emailPattern, message: ERROR_MESSAGES.email }]}
      >
        <Input placeholder={PLACEHOLDERS.email} />
      </Form.Item>
      <Form.Item
        label={LABELS.epamEmail}
        tooltip={TOOLTIPS.epamEmail}
        name="contactsEpamEmail"
        rules={[{ pattern: epamEmailPattern, message: ERROR_MESSAGES.epamEmail }]}
      >
        <Input placeholder={PLACEHOLDERS.epamEmail} />
      </Form.Item>
    </FormCard>
  );
}

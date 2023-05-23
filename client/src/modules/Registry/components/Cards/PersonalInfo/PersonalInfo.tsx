import { Form, Input, Typography } from 'antd';
import { Dispatch, SetStateAction } from 'react';
import { Location } from 'common/models';
import { DataProcessingCheckbox, FormButtons, FormCard } from 'modules/Registry/components';
import { emailPattern, englishNamePattern, epamEmailPattern } from 'services/validators';
import { CARD_TITLES, ERROR_MESSAGES, EXTRAS, LABELS, PLACEHOLDERS, TOOLTIPS } from 'modules/Registry/constants';
import { LocationSelect } from 'components/Forms';

type Props = {
  location: Location | null;
  setLocation: Dispatch<SetStateAction<Location | null>>;
  isStudentForm?: boolean;
};

const { Title } = Typography;

export function PersonalInfo({ location, setLocation, isStudentForm }: Props) {
  return (
    <FormCard
      title={
        <Title level={5} style={{ marginBottom: 0 }}>
          {CARD_TITLES.personalInfo}
        </Title>
      }
    >
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
        rules={[{ required: true, pattern: englishNamePattern, message: ERROR_MESSAGES.inEnglish('Last name') }]}
        extra={EXTRAS.inEnglish}
      >
        <Input placeholder={PLACEHOLDERS.lastName} />
      </Form.Item>
      <Form.Item
        label={LABELS.location}
        tooltip={isStudentForm ? TOOLTIPS.locationStudent : TOOLTIPS.locationMentor}
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
        required={!isStudentForm}
        rules={[{ pattern: epamEmailPattern, message: ERROR_MESSAGES.epamEmail }]}
      >
        <Input placeholder={PLACEHOLDERS.epamEmail} />
      </Form.Item>
      {isStudentForm ? (
        <>
          <DataProcessingCheckbox isStudentForm />
          <FormButtons />
        </>
      ) : null}
    </FormCard>
  );
}

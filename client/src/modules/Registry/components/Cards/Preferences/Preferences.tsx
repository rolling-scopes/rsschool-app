import { Typography, Form, Radio } from 'antd';
import { CARD_TITLES, EXTRAS, LABELS, WIDE_FORM_ITEM_LAYOUT } from 'modules/Registry/constants';
import { FormCard } from 'modules/Registry/components';
import { MentorOptionsDtoPreferedStudentsLocationEnum } from '@client/api';

const { Title } = Typography;

const studentsLimits = [2, 3, 4, 5, 6];
const locations = [
  {
    value: MentorOptionsDtoPreferedStudentsLocationEnum.Any,
    label: 'Anywhere',
  },
  {
    value: MentorOptionsDtoPreferedStudentsLocationEnum.Country,
    label: 'My country only',
  },
  {
    value: MentorOptionsDtoPreferedStudentsLocationEnum.City,
    label: 'My city only',
  },
];

const formItemLayout = WIDE_FORM_ITEM_LAYOUT();

export function Preferences() {
  return (
    <FormCard
      title={
        <Title level={5} style={{ marginBottom: 0 }}>
          {CARD_TITLES.preferences}
        </Title>
      }
    >
      <Form.Item {...formItemLayout} name="maxStudentsLimit" label={LABELS.studentsCount} extra={EXTRAS.readyToMentor}>
        <Radio.Group>
          {studentsLimits.map(elem => (
            <Radio key={elem} value={elem}>
              {elem}
            </Radio>
          ))}
        </Radio.Group>
      </Form.Item>
      <Form.Item {...formItemLayout} name="preferedStudentsLocation" label={LABELS.studentsLocation}>
        <Radio.Group>
          {locations.map(({ value, label }) => (
            <Radio key={value} value={value}>
              {label}
            </Radio>
          ))}
        </Radio.Group>
      </Form.Item>
    </FormCard>
  );
}

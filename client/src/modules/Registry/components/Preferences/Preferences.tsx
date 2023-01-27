import { Typography, Form, Radio } from 'antd';
import { EXTRAS, LABELS } from 'modules/Registry/constants';
import { FormCard } from 'modules/Registry/components';

const { Title } = Typography;

const studentsLimits = [2, 3, 4, 5, 6];
const locations = [
  {
    value: 'any',
    label: 'Anywhere',
  },
  {
    value: 'country',
    label: 'My country only',
  },
  {
    value: 'city',
    label: 'My city only',
  },
];

export function Preferences() {
  return (
    <FormCard title={<Title level={5}>Preferences about students</Title>}>
      <Form.Item
        name="maxStudentsLimit"
        label={LABELS.studentsCount}
        labelAlign="right"
        initialValue={2}
        extra={EXTRAS.readyToMentor}
      >
        <Radio.Group>
          {studentsLimits.map(elem => (
            <Radio key={elem} value={elem}>
              {elem}
            </Radio>
          ))}
        </Radio.Group>
      </Form.Item>
      <Form.Item name="preferedStudentsLocation" label={LABELS.studentsLocation} initialValue="any">
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

import { Form, Select, Tag, Input, Checkbox, Space, Button, Typography } from 'antd';
import { CourseIcon } from 'components/Icons';
import { LANGUAGES } from 'data/languages';
import {
  DATA_PROCESSING_TEXT,
  ERROR_MESSAGES,
  LABELS,
  PLACEHOLDERS,
  VALIDATION_RULES,
} from 'modules/Registry/constants';
import { formatMonthFriendly } from 'services/formatter';
import { Course } from 'services/models';
import { FormCard } from '../FormCard';

type Props = {
  checkedList: number[];
  courses: Course[];
  onPrevious: () => void;
};

const { Title } = Typography;

export function AdditionalInfo({ courses, checkedList, onPrevious }: Props) {
  return (
    <FormCard title={<Title level={5}>Additional information</Title>}>
      <Form.Item name="preferedCourses" label={LABELS.courses} labelAlign="right" requiredMark="optional">
        <Select
          mode="multiple"
          value={checkedList}
          placeholder={PLACEHOLDERS.courses}
          options={courses.map(c => ({
            label: (
              <>
                <CourseIcon course={c} /> {`${c.name} (Start: ${formatMonthFriendly(c.startDate)})`}{' '}
                {c.planned ? <Tag color="orange">Planned</Tag> : <Tag color="green">In Progress</Tag>}
              </>
            ),
            value: c.id,
          }))}
        />
      </Form.Item>
      <Form.Item
        name="languagesMentoring"
        label={LABELS.languages}
        labelAlign="right"
        rules={VALIDATION_RULES}
        required
      >
        <Select
          mode="multiple"
          placeholder={PLACEHOLDERS.languages}
          options={LANGUAGES.map(({ name }) => ({
            label: name,
            value: name,
          }))}
        />
      </Form.Item>
      <Form.Item name="aboutMyself" label={LABELS.aboutYourself} labelAlign="right">
        <Input.TextArea rows={6} placeholder={PLACEHOLDERS.aboutYourself} />
      </Form.Item>
      <Form.Item
        name="dataProcessing"
        valuePropName="checked"
        rules={[
          {
            validator: (_, value) =>
              value ? Promise.resolve() : Promise.reject(new Error(ERROR_MESSAGES.shouldAgree)),
          },
        ]}
      >
        <Checkbox style={{ color: 'rgba(0, 0, 0, 0.45)' }}>{DATA_PROCESSING_TEXT}</Checkbox>
      </Form.Item>
      <Form.Item className="buttons">
        <Space>
          <Button size="large" type="default" onClick={onPrevious}>
            Previous
          </Button>
          <Button size="large" type="primary" htmlType="submit">
            Submit
          </Button>
        </Space>
      </Form.Item>
    </FormCard>
  );
}

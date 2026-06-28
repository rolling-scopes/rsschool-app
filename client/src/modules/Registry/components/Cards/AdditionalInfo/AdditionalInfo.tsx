import { Form, Select, Input, Typography } from 'antd';
import { CARD_TITLES, LABELS, PLACEHOLDERS, WIDE_FORM_ITEM_LAYOUT } from '@client/modules/Registry/constants';
import { Course } from '@client/services/models';
import {
  CourseLabel,
  DataProcessingCheckbox,
  FormButtons,
  FormCard,
  LanguagesMentoring,
} from '@client/modules/Registry/components';

type Props = {
  courses: Course[];
  onPrevious: () => void;
};

const { Title } = Typography;

const formItemLayout = WIDE_FORM_ITEM_LAYOUT();

export function AdditionalInfo({ courses, onPrevious }: Props) {
  return (
    <FormCard
      title={
        <Title level={5} style={{ marginBottom: 0 }}>
          {CARD_TITLES.additionalInfo}
        </Title>
      }
    >
      <Form.Item {...formItemLayout} name="preferedCourses" label={LABELS.courses}>
        <Select
          mode="multiple"
          placeholder={PLACEHOLDERS.courses}
          options={courses.map(course => ({
            label: <CourseLabel course={course} />,
            value: course.id,
          }))}
        />
      </Form.Item>
      <LanguagesMentoring />
      <Form.Item {...formItemLayout} name="aboutMyself" label={LABELS.aboutYourself}>
        <Input.TextArea rows={6} placeholder={PLACEHOLDERS.aboutYourself} />
      </Form.Item>
      <DataProcessingCheckbox />
      <FormButtons onPrevious={onPrevious} />
    </FormCard>
  );
}

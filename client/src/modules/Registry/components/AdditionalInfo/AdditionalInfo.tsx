import { Form, Select, Input, Typography } from 'antd';
import { LABELS, PLACEHOLDERS, WIDE_FORM_ITEM_LAYOUT } from 'modules/Registry/constants';
import { Course } from 'services/models';
import {
  CourseLabel,
  DataProcessingCheckbox,
  FormButtons,
  FormCard,
  LanguagesMentoring,
} from 'modules/Registry/components';

type Props = {
  checkedList: number[];
  courses: Course[];
  onPrevious: () => void;
};

const { Title } = Typography;

const formItemLayout = WIDE_FORM_ITEM_LAYOUT();

export function AdditionalInfo({ courses, checkedList, onPrevious }: Props) {
  return (
    <FormCard title={<Title level={5}>Additional information</Title>}>
      <Form.Item {...formItemLayout} name="preferedCourses" label={LABELS.courses} requiredMark="optional">
        <Select
          mode="multiple"
          value={checkedList}
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

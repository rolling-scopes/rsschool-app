import { Form, Select, Typography } from 'antd';
import { CourseDto } from 'api';
import { CourseLabel, FormCard, LanguagesMentoring } from 'modules/Registry/components';
import { CARD_TITLES, LABELS, PLACEHOLDERS } from 'modules/Registry/constants';

const { Title } = Typography;

type Props = {
  courses: CourseDto[];
};

export function CourseDetails({ courses }: Props) {
  return (
    <FormCard title={<Title level={5}>{CARD_TITLES.courseDetails}</Title>}>
      <Form.Item label={LABELS.course} name="courseId">
        <Select
          placeholder={PLACEHOLDERS.courses}
          options={courses.map(course => ({
            label: <CourseLabel course={course} />,
            value: course.id,
          }))}
        />
      </Form.Item>
      <LanguagesMentoring isStudentForm />
    </FormCard>
  );
}

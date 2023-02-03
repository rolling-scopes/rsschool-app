import { Form, Select, Typography } from 'antd';
import { CourseDto } from 'api';
import { CourseLabel, FormCard, LanguagesMentoring } from 'modules/Registry/components';
import { LABELS, PLACEHOLDERS } from 'modules/Registry/constants';
import { UserFull } from 'services/user';

const { Title } = Typography;

type IdName = {
  id: number;
  name: string;
};

type Props = {
  student: {
    profile: UserFull;
    registeredForCourses: IdName[];
    courses: CourseDto[];
  };
};

export function CourseDetails({ student }: Props) {
  return (
    <FormCard title={<Title level={5}>Course details</Title>}>
      <Form.Item label={LABELS.course} name="courseId">
        <Select
          placeholder={PLACEHOLDERS.courses}
          options={student?.courses.map(course => ({
            label: <CourseLabel course={course} />,
            value: course.id,
          }))}
        />
      </Form.Item>
      <LanguagesMentoring isStudentForm />
    </FormCard>
  );
}

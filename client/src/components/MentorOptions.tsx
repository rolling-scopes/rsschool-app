import { Button, Form, FormInstance, Select, Typography } from 'antd';
import { PreferredStudentsLocation } from 'common/enums/mentor';
import { StudentSearch } from './StudentSearch';

type Options = {
  preselectedCourses: number[];
  maxStudentsLimit: number;
  preferedStudentsLocation: PreferredStudentsLocation;
  preferredCourses: number[];
};

export function MentorOptions({
  course,
  mentorData,
  form,
  handleSubmit,
}: {
  form: FormInstance;
  mentorData: Options | null;
  handleSubmit: (values: Options) => Promise<void>;
  course: { id: number; name: string };
}) {
  return (
    <>
      <Typography.Paragraph>
        We kindly ask you confirm your desire to be mentor in {course.name} course. Just in case, you can change your
        preference below and select student which you want to mentor
      </Typography.Paragraph>
      <Form
        initialValues={mentorData ?? undefined}
        style={{ marginTop: 32 }}
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Form.Item
          name="maxStudentsLimit"
          label="How many students are you ready to mentor per course?"
          rules={[{ required: true, message: 'Please select students count' }]}
        >
          <Select style={{ width: 200 }} placeholder="Students count...">
            <Select.Option value={2}>2</Select.Option>
            <Select.Option value={3}>3</Select.Option>
            <Select.Option value={4}>4</Select.Option>
            <Select.Option value={5}>5</Select.Option>
            <Select.Option value={6}>6</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="preferedStudentsLocation"
          label="Preferred students location"
          help="We will use this information to distribute students"
          rules={[{ required: true, message: 'Please select a prefered location option' }]}
        >
          <Select placeholder="Select a prefered option...">
            <Select.Option value={'any'}>Any city or country</Select.Option>
            <Select.Option value={'country'}>My country only</Select.Option>
            <Select.Option value={'city'}>My city only</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          help="If you want to be a mentor of particular students"
          name="students"
          label="Predefined students (if any)"
        >
          <StudentSearch onlyStudentsWithoutMentorShown={true} labelInValue courseId={course.id} mode="multiple" />
        </Form.Item>

        <Button style={{ marginTop: 32 }} size="large" type="primary" htmlType="submit">
          Confirm
        </Button>
      </Form>
    </>
  );
}

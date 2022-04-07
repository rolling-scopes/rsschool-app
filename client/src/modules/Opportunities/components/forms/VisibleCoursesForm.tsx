import { Card, Checkbox, Form, FormInstance, Typography } from 'antd';
import { ResumeCourseDto } from 'api';
import { ForwardedRef, forwardRef } from 'react';

const { Item } = Form;

type Props = {
  courses: ResumeCourseDto[] | null;
  visibleCourses: number[];
};

const VisibleCoursesForm = forwardRef((props: Props, ref: ForwardedRef<FormInstance>) => {
  const { courses, visibleCourses } = props;

  if (!courses?.length) return <Typography.Text>No courses to show</Typography.Text>;

  const [form] = Form.useForm();

  const data = courses.reduce((acc: Record<string, boolean>, { id }) => {
    acc[id] = visibleCourses.includes(id);
    return acc;
  }, {});

  return (
    <Card title="Visible courses">
      <Form
        ref={ref}
        initialValues={data}
        size="middle"
        layout="inline"
        form={form}
        colon={false}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          overflowY: 'auto',
          maxHeight: '15vh',
          gap: '10px',
          maxWidth: '314px',
        }}
      >
        {courses.map(({ id, fullName }) => (
          <Item
            key={id}
            name={id}
            label={<span style={{ lineHeight: 'normal', whiteSpace: 'normal', textAlign: 'left' }}>{fullName}</span>}
            colon={false}
            labelAlign="right"
            style={{ marginBottom: '0', overflow: 'hidden' }}
            valuePropName="checked"
            labelCol={{ span: 22 }}
            wrapperCol={{ span: 1 }}
          >
            <Checkbox />
          </Item>
        ))}
      </Form>
    </Card>
  );
});

export default VisibleCoursesForm;

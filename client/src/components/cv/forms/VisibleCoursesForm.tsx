import { forwardRef } from 'react';
import { Checkbox, Form, Typography, Card, FormInstance } from 'antd';
import { CourseDataShortened, VisibleCourses } from 'modules/Opportunities/models';

const { Item } = Form;

type Props = {
  courses: CourseDataShortened[] | null;
  visibleCourses: VisibleCourses;
};

const VisibleCoursesForm = forwardRef((props: Props, ref: React.ForwardedRef<FormInstance>) => {
  const { courses, visibleCourses } = props;

  if (!courses || !courses.length) return <Typography.Text>No courses to show</Typography.Text>;

  const [form] = Form.useForm();

  const data = courses.reduce((acc: Record<string, boolean>, { courseId }) => {
    acc[courseId] = visibleCourses.includes(courseId);
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
        {courses.map(({ courseId, courseFullName }) => (
          <Item
            key={courseId}
            name={courseId}
            label={
              <span style={{ lineHeight: 'normal', whiteSpace: 'normal', textAlign: 'left' }}>{courseFullName}</span>
            }
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

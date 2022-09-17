import { ForwardedRef, forwardRef } from 'react';
import { Card, Checkbox, Form, FormInstance, Typography, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { ResumeCourseDto } from 'api';

const { Item } = Form;
const { Text } = Typography;

type Props = {
  courses: ResumeCourseDto[] | null;
  visibleCourses: number[];
};

export const VisibleCoursesForm = forwardRef((props: Props, ref: ForwardedRef<FormInstance>) => {
  const { courses, visibleCourses } = props;

  if (!courses?.length) return <Typography.Text>No courses to show</Typography.Text>;

  const [form] = Form.useForm();

  const data = courses.reduce((acc: Record<string, boolean>, { id }) => {
    acc[id] = visibleCourses.includes(id);
    return acc;
  }, {});

  return (
    <Card
      title={
        <Text>
          Show RS Courses{' '}
          <Tooltip title="Selected courses will be displayed in your CV">
            <InfoCircleOutlined style={{ fontSize: 12, opacity: 0.7 }} />
          </Tooltip>
        </Text>
      }
      style={{ width: '70vw' }}
    >
      <Form
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}
        ref={ref}
        initialValues={data}
        form={form}
        labelCol={{ span: 9, offset: 4 }}
        wrapperCol={{ span: 10 }}
      >
        {courses.map(({ id, fullName }) => (
          <Item
            key={id}
            name={id}
            colon={false}
            label={<span style={{ whiteSpace: 'normal' }}>{fullName}</span>}
            style={{ marginBottom: '0', overflow: 'hidden' }}
            valuePropName="checked"
          >
            <Checkbox />
          </Item>
        ))}
      </Form>
    </Card>
  );
});

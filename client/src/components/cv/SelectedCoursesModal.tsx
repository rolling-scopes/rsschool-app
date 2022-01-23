import React, { useEffect } from 'react';
import { Button, Checkbox, Form, Modal } from 'antd';
import { CourseToShow } from 'modules/Opportunities/models';

type Props = {
  courses: CourseToShow[];
  isVisible: boolean;
  onCancel: () => void;
  onOk: (values: any) => void;
};

export function SelectedCoursesModal(props: Props) {
  const { onCancel, onOk, courses, isVisible } = props;

  const [form] = Form.useForm();

  const handleSumbission = async () => {
    const values = await form.validateFields().catch(() => null);
    const newCoursesToShow = courses.map(course => ({
      ...course,
      isVisible: values[course.courseId],
    }));
    onOk(newCoursesToShow);
  };

  const data = courses.reduce((acc: Record<string, boolean>, { isVisible, courseId }) => {
    acc[courseId] = isVisible;
    return acc;
  }, {});

  useEffect(() => {
    form.setFieldsValue(data);
  });

  const fillAllFields = (value: boolean) => {
    const newValues = courses.reduce((acc: Record<string, boolean>, { courseId }) => {
      acc[courseId] = value;
      return acc;
    }, {});
    form.setFieldsValue(newValues);
  };

  const modalButtons = (
    <>
      <Button key="Select all" onClick={() => fillAllFields(true)} type="text">
        Select all
      </Button>
      <Button key="Deselect all" onClick={() => fillAllFields(false)} type="text">
        Deselect all
      </Button>
      <Button key="Cancel" onClick={onCancel}>
        Cancel
      </Button>
      <Button key="Save" type="primary" onClick={handleSumbission}>
        Save selection
      </Button>
    </>
  );

  return (
    <Modal
      title="Visible courses"
      visible={isVisible}
      onOk={handleSumbission}
      onCancel={onCancel}
      footer={modalButtons}
    >
      <Form
        size="middle"
        layout="horizontal"
        form={form}
        colon={false}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          overflowY: 'auto',
          maxHeight: '60vh',
          gap: '15px',
          maxWidth: '472px',
        }}
      >
        {courses.map(({ courseId, courseFullName }) => (
          <Form.Item
            key={courseId}
            name={courseId}
            label={<span style={{ whiteSpace: 'normal' }}>{courseFullName}</span>}
            colon={false}
            labelAlign="left"
            style={{ marginBottom: '0', overflow: 'hidden' }}
            valuePropName="checked"
            labelCol={{ span: 21 }}
            wrapperCol={{ span: 1 }}
          >
            <Checkbox />
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
}

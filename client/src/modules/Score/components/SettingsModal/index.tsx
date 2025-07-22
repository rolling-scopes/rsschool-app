import { Button, Checkbox, Form, Modal, Row, Col } from 'antd';
import { Store } from 'antd/lib/form/interface';
import type { CourseTaskDto } from 'api';

type Props = {
  courseTasks: (CourseTaskDto & { isVisible?: boolean })[];
  isVisible: boolean;
  onCancel: () => void;
  onOk: (values: Store) => void;
};

export function SettingsModal(props: Props) {
  const { onCancel, onOk, courseTasks, isVisible } = props;
  const [form] = Form.useForm();

  const onOkHandle = async () => {
    const values = await form.validateFields().catch(() => null);
    if (!values) {
      return;
    }
    onOk(values);
  };

  const initialValues = courseTasks.reduce(
    (acc, curr) => {
      acc[curr.id] = curr.isVisible;
      return acc;
    },
    {} as Record<string, boolean | undefined>,
  );

  const fillAllFields = (value: boolean) => {
    const newValues: Record<string, boolean | undefined> = {};
    courseTasks.forEach(task => {
      newValues[task.id] = value;
    });
    form.setFieldsValue(newValues);
  };

  return (
    <Modal
      title="Columns visibility"
      open={isVisible}
      onOk={onOkHandle}
      onCancel={onCancel}
      footer={[
        <Button key="Select all" onClick={() => fillAllFields(true)} type="text">
          Select all
        </Button>,
        <Button key="Deselect all" onClick={() => fillAllFields(false)} type="text">
          Deselect all
        </Button>,
        <Button key="Cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="Submit" type="primary" onClick={onOkHandle}>
          Submit
        </Button>,
      ]}
    >
      <Form form={form} initialValues={initialValues} layout="vertical">
        <Row gutter={[16, 0]} style={{ maxHeight: '60vh', overflowY: 'scroll' }}>
          {courseTasks.map(courseTask => (
            <Col span={12} key={courseTask.id}>
              <Form.Item name={courseTask.id} valuePropName="checked" style={{ marginBottom: 4 }}>
                <Checkbox>{courseTask.name}</Checkbox>
              </Form.Item>
            </Col>
          ))}
        </Row>
      </Form>
    </Modal>
  );
}

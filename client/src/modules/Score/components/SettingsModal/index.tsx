import { Button, Checkbox, Form, Modal } from 'antd';
import { Store } from 'rc-field-form/lib/interface';
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

  const initialValues = courseTasks.reduce((acc, curr) => {
    acc[curr.name] = curr.isVisible;
    return acc;
  }, {} as Record<string, boolean | undefined>);

  const fillAllFields = (value: boolean) => {
    const newValues: Record<string, boolean | undefined> = {};
    courseTasks.reduce((acc, curr) => {
      acc[curr.name] = value;
      return acc;
    }, newValues);
    form.setFieldsValue(newValues);
  };

  return (
    <Modal
      title="Columns visibility"
      visible={isVisible}
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
      <Form
        size="small"
        layout="horizontal"
        form={form}
        initialValues={initialValues}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          overflowY: 'scroll',
          maxHeight: '60vh',
          gap: '12px',
          maxWidth: '472px',
        }}
      >
        {courseTasks.map(el => (
          <Form.Item
            key={el.id}
            name={el.name}
            label={el.name}
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

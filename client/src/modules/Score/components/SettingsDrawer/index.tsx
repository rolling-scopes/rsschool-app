import { Button, Checkbox, Drawer, Form, Space } from 'antd';
import { Store } from 'antd/lib/form/interface';
import type { CourseTaskDto } from 'api';

type Props = {
  courseTasks: (CourseTaskDto & { isVisible?: boolean })[];
  isVisible: boolean;
  onCancel: () => void;
  onOk: (values: Store) => void;
};

export function SettingsDrawer(props: Props) {
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
    <Drawer
      title="Columns visibility"
      open={isVisible}
      onClose={onCancel}
      footer={
        <Space>
          <Button key="Select all" onClick={() => fillAllFields(true)} type="text">
            Select all
          </Button>
          <Button key="Deselect all" onClick={() => fillAllFields(false)} type="text">
            Deselect all
          </Button>
          <Button key="Cancel" onClick={onCancel}>
            Cancel
          </Button>
          <Button key="Save" type="primary" onClick={onOkHandle}>
            Save
          </Button>
        </Space>
      }
    >
      <Form form={form} initialValues={initialValues} layout="vertical">
        <Space style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          {courseTasks.map(courseTask => (
            <Form.Item key={courseTask.id} name={courseTask.id} valuePropName="checked" style={{ marginBottom: 4 }}>
              <Checkbox>{courseTask.name}</Checkbox>
            </Form.Item>
          ))}
        </Space>
      </Form>
    </Drawer>
  );
}

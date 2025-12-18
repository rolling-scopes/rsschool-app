import { Button, Checkbox, Drawer, Form, Space, theme } from 'antd';
import { Store } from 'antd/lib/form/interface';
import type { CourseTaskDto } from 'api';
import SettingsItem from '@client/components/SettingsItem';
import {
  CheckSquareOutlined,
  CloseCircleOutlined,
  CloseSquareOutlined,
  SaveOutlined,
  TableOutlined,
} from '@ant-design/icons';

type Props = {
  courseTasks: (CourseTaskDto & { isVisible?: boolean })[];
  isVisible: boolean;
  onCancel: () => void;
  onOk: (values: Store) => void;
};

export function SettingsDrawer(props: Props) {
  const { onCancel, onOk, courseTasks, isVisible } = props;
  const [form] = Form.useForm();
  const { token } = theme.useToken();

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

  const actions = [
    <Button
      type="text"
      title="Select all"
      onClick={() => fillAllFields(true)}
      icon={<CheckSquareOutlined style={{ color: token.colorInfo }} />}
    />,
    <Button
      type="text"
      title="Deselect all"
      onClick={() => fillAllFields(false)}
      icon={<CloseSquareOutlined style={{ color: token.colorWarning }} />}
    />,
    <Button
      type="text"
      title="Cancel"
      onClick={onCancel}
      icon={<CloseCircleOutlined style={{ color: token.colorError }} />}
    />,
    <Button
      type="text"
      title="Save"
      onClick={onOkHandle}
      icon={<SaveOutlined style={{ color: token.colorSuccess }} />}
    />,
  ];

  return (
    <Drawer title="Score settings" open={isVisible} onClose={onCancel} styles={{ body: { containerType: 'size' } }}>
      <SettingsItem header="Columns visibility" IconComponent={TableOutlined} actions={actions}>
        <Form form={form} initialValues={initialValues} layout="vertical">
          <Space style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {courseTasks.map(courseTask => (
              <Form.Item
                key={courseTask.id}
                name={courseTask.id}
                valuePropName="checked"
                style={{ marginBottom: 4, width: 200 }}
              >
                <Checkbox>{courseTask.name}</Checkbox>
              </Form.Item>
            ))}
          </Space>
        </Form>
      </SettingsItem>
    </Drawer>
  );
}

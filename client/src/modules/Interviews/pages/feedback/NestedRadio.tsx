import { Radio, Space, FormInstance, Form } from 'antd';
import { RadioOption } from 'data/interviews/technical-screening';
import { useEffect } from 'react';

const { Item, useWatch } = Form;
const { Group } = Radio;

/**
 * handles dynamic display if parent is selected and automatic cleanup
 */
export function NestedRadio({
  form,
  option,
  parentId,
}: {
  form: FormInstance;
  option: RadioOption;
  parentId: string;
  stepId: string;
}) {
  const parentValue = useWatch(parentId);

  useEffect(() => {
    //reset current value in form, if parent value changes
    if (parentValue && parentValue !== option.id) {
      form.resetFields([option.id]);
    }
  }, [parentValue, option.id]);

  if (!option.options) {
    return null;
  }

  return (
    <Item shouldUpdate noStyle>
      {() =>
        form.getFieldValue(parentId) === option.id && (
          <Item name={option.id} rules={[{ required: true, message: 'Required' }]}>
            <Group>
              <Space direction="vertical" style={{ marginLeft: '24px' }}>
                {option.options?.map((subOption: any) => (
                  <Radio key={subOption.id} value={subOption.id}>
                    {subOption.title}
                  </Radio>
                ))}
              </Space>
            </Group>
          </Item>
        )
      }
    </Item>
  );
}

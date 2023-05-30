import { Radio, Space, FormInstance, Form } from 'antd';
import { RadioOption } from 'data/interviews/technical-screening';
import { useEffect } from 'react';

const { Item } = Form;
const { Group } = Radio;

/**
 * handles dynamic display if parent is selected and automatic cleanup
 */
export function NestedRadio({
  form,
  option,
  parentId,
  stepId,
}: {
  form: FormInstance;
  option: RadioOption;
  parentId: string;
  stepId: string;
}) {
  useEffect(() => {
    return () => {
      if (option.options) {
        form.resetFields([getFieldName(stepId, option.id)]);
      }
    };
  }, [option]);

  if (!option.options) {
    return null;
  }

  return (
    <Item shouldUpdate noStyle>
      {() =>
        form.getFieldValue(getFieldName(stepId, parentId)) === option.id && (
          <Item name={getFieldName(stepId, option.id)} rules={[{ required: true, message: 'Required' }]}>
            <Group>
              <Space direction="vertical" style={{ marginLeft: '24px' }}>
                {option.options?.map((subOption: any) => (
                  <Radio key={subOption.id} value={subOption.title}>
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

export function getFieldName(step: string, field: string) {
  return [step, field];
}

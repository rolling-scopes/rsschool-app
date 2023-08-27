import { Form, FormInstance, Input, Radio, Space, Typography, Checkbox } from 'antd';
import { StepFormItem, RadioOption, FeedbackStepId } from 'data/interviews/technical-screening';
import { NestedRadio } from './NestedRadio';
import { InputType } from 'data/interviews';
import { Fragment } from 'react';
import { QuestionList } from './QuestionList';

const { Item } = Form;
const { Group } = Radio;
const { Text } = Typography;

export function FormItem({ item, form, stepId }: { item: StepFormItem; form: FormInstance; stepId: FeedbackStepId }) {
  switch (item.type) {
    case InputType.Radio:
      return (
        <Item name={item.id} rules={[{ required: item.required, message: 'Required' }]}>
          <Group>
            <Space direction="vertical">
              {item.options.map((option: RadioOption) => {
                return (
                  <Fragment key={option.id}>
                    <Radio key={option.id} value={option.id}>
                      {option.title}
                    </Radio>
                    <NestedRadio form={form} option={option} parentId={item.id} stepId={stepId} />
                  </Fragment>
                );
              })}
            </Space>
          </Group>
        </Item>
      );
    case InputType.RadioButton:
      return (
        <Item name={item.id} rules={[{ required: item.required, message: 'Required' }]}>
          <Group buttonStyle="solid">
            {item.description && (
              <Text type="secondary">
                <div>{item.description}</div>
              </Text>
            )}
            {item.options.map((option: RadioOption) => {
              return (
                <Radio.Button key={option.id} value={option.id}>
                  {option.title}
                </Radio.Button>
              );
            })}
          </Group>
        </Item>
      );
    case InputType.Checkbox:
      return (
        <Item name={item.id} rules={[{ required: item.required, message: 'Required' }]}>
          <Checkbox.Group
            options={item.options.map((option: RadioOption) => ({ label: option.title, value: option.id }))}
          />
        </Item>
      );
    case InputType.Input:
      return (
        <Item name={item.id} rules={[{ required: item.required, message: 'Required' }]}>
          <Input
            placeholder={item.placeholder}
            type={item.inputType}
            min={item.min}
            max={item.max}
            style={{ width: item.inputType === 'number' ? 100 : undefined }}
          />
        </Item>
      );
    case InputType.TextArea:
      return (
        <Item name={item.id} rules={[{ required: item.required, message: 'Required' }]}>
          <Input.TextArea placeholder={item.placeholder} />
        </Item>
      );
    case InputType.Rating: {
      return <QuestionList form={form} question={item} stepId={stepId} />;
    }
    default:
      return null;
  }
}

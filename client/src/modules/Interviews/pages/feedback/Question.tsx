import { Form, FormInstance, Input, Radio, Space, Typography } from 'antd';
import { Question, RadioOption } from 'data/interviews/technical-screening';
import { NestedRadio, getFieldName } from './NestedRadio';
import { InputType } from 'data/interviews';
import { Fragment } from 'react';

const { Item } = Form;
const { Group } = Radio;
const { Text } = Typography;

export function Question({ question, form, stepId }: { question: Question; form: FormInstance; stepId: string }) {
  switch (question.type) {
    case InputType.Radio:
      return (
        <Item name={getFieldName(stepId, question.id)} rules={[{ required: question.required, message: 'Required' }]}>
          <Group>
            <Space direction="vertical">
              {question.options.map((option: RadioOption) => {
                return (
                  <Fragment key={option.id}>
                    <Radio type="" key={option.id} value={option.id}>
                      {option.title}
                    </Radio>
                    <NestedRadio form={form} option={option} parentId={question.id} stepId={stepId} />
                  </Fragment>
                );
              })}
            </Space>
          </Group>
        </Item>
      );
    case InputType.RadioButton:
      return (
        <Item name={getFieldName(stepId, question.id)} rules={[{ required: question.required, message: 'Required' }]}>
          <Group buttonStyle="solid">
            {question.description && (
              <Text type="secondary">
                <div dangerouslySetInnerHTML={{ __html: question.description }} />
              </Text>
            )}
            {question.options.map((option: RadioOption) => {
              return (
                <Radio.Button key={option.id} value={option.id}>
                  {option.title}
                </Radio.Button>
              );
            })}
          </Group>
        </Item>
      );
    case InputType.Input:
      return (
        <Item name={getFieldName(stepId, question.id)} rules={[{ required: question.required, message: 'Required' }]}>
          <Input
            placeholder={question.placeholder}
            type={question.inputType}
            min={0}
            max={100}
            style={{ width: question.inputType === 'number' ? 100 : undefined }}
          />
        </Item>
      );
    case InputType.TextArea:
      return (
        <Item name={getFieldName(stepId, question.id)} rules={[{ required: question.required, message: 'Required' }]}>
          <Input.TextArea placeholder={question.placeholder} />
        </Item>
      );
    default:
      return null;
  }
}

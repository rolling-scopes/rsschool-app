import { Button, ButtonProps, Form, Modal, Spin } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import React from 'react';

type Props<T> = React.PropsWithChildren<{
  data: T;
  title?: string;
  submit: (arg: any) => void;
  onCancel: (arg: any) => void;
  onFooterCancel: (arg: any) => void;
  onChange?: (values: any) => void;
  getInitialValues?: (arg: any) => any;
  loading?: boolean;
  okText?: string;
  form?: FormInstance;
  okButtonProps?: ButtonProps;
  resetOnCancel?: boolean;
}>;

export function SplitCancelModalForm<T extends object>(props: Props<T>) {
  const antForm = Form.useForm()[0];
  const form = props.form || antForm;

  if (props.data == null) {
    return null;
  }
  const initialValues = props.getInitialValues ? props.getInitialValues?.(props.data) : props.data;
  return (
    <Modal
      style={{ top: 20 }}
      width={700}
      open={true}
      title={props.title}
      onCancel={e => {
        props.onCancel(e);
        if (props.resetOnCancel !== false) {
          form.resetFields();
        }
      }}
      footer={[
        <Button key="back" onClick={props.onFooterCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={props.loading}
          onClick={async e => {
            e.preventDefault();
            const values = await form.validateFields().catch(() => null);
            if (values == null) {
              return;
            }
            props.submit(values);
          }}
          {...props.okButtonProps}
        >
          {props.okText ?? 'Save'}
        </Button>,
      ]}
    >
      <Spin spinning={props.loading ?? false}>
        <Form
          layout="vertical"
          onValuesChange={() => props.onChange?.(form.getFieldsValue())}
          form={form}
          initialValues={initialValues}
        >
          {props.children}
        </Form>
      </Spin>
    </Modal>
  );
}

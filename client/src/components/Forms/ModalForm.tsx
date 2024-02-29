import { ButtonProps, Form, Modal, Spin } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import React from 'react';

type Props<T> = React.PropsWithChildren<{
  data: T;
  title?: string;
  submit: (arg: any) => void;
  cancel: (arg: any) => void;
  onChange?: (values: any) => void;
  getInitialValues?: (arg: any) => any;
  loading?: boolean;
  okText?: string;
  form?: FormInstance;
  okButtonProps?: ButtonProps;
}>;

export function ModalForm<T extends object>(props: Props<T>) {
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
      okText={props.okText ?? 'Save'}
      onOk={async e => {
        e.preventDefault();
        const values = await form.validateFields().catch(() => null);
        if (values == null) {
          return;
        }
        props.submit(values);
      }}
      okButtonProps={{ disabled: props.loading, ...props.okButtonProps }}
      onCancel={e => {
        props.cancel(e);
        form.resetFields();
      }}
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

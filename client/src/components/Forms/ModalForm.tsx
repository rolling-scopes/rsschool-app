import { Form, Modal, Spin } from 'antd';
import * as React from 'react';

type Props = {
  data: any;
  title?: string;
  submit: (arg: any) => void;
  cancel: (arg: any) => void;
  onChange?: (values: any) => void;
  getInitialValues?: (arg: any) => any;
  children: any;
  loading?: boolean;
  okText?: string;
};

export function ModalForm(props: Props) {
  if (props.data == null) {
    return null;
  }
  const [form] = Form.useForm();
  const initialValues = props.getInitialValues ? props.getInitialValues?.(props.data) : props.data;
  return (
    <Modal
      style={{ top: 20 }}
      visible={true}
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
      onCancel={e => {
        props.cancel(e);
        form.resetFields();
      }}
    >
      <Spin spinning={props.loading ?? false}>
        <Form
          onValuesChange={() => props.onChange?.(form.getFieldsValue())}
          form={form}
          initialValues={initialValues}
          layout="vertical"
        >
          {props.children}
        </Form>
      </Spin>
    </Modal>
  );
}

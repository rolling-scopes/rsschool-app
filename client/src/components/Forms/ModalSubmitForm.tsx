import { Alert, Button, Form, Modal, Result, Spin } from 'antd';
import * as React from 'react';

type Props = {
  data: any;
  title?: string;
  submit: (arg: any) => void;
  close: (arg: any) => void;
  onChange?: (values: any) => void;
  getInitialValues?: (arg: any) => any;
  children: any;
  loading?: boolean;
  submitted?: boolean;
  successText?: string;
  errorText?: string;
};

export function ModalSubmitForm(props: Props) {
  if (props.data == null) {
    return null;
  }
  const [form] = Form.useForm();
  const initialValues = props.getInitialValues ? props.getInitialValues?.(props.data) : props.data;
  return (
    <Modal
      visible={true}
      footer={props.submitted ? null : undefined}
      title={props.title}
      okText="Submit"
      onOk={async e => {
        e.preventDefault();
        const values = await form.validateFields().catch(() => null);
        if (values == null) {
          return;
        }
        props.submit(values);
      }}
      onCancel={e => {
        props.close(e);
        form.resetFields();
      }}
    >
      <Spin spinning={props.loading ?? false}>
        {props.errorText ? (
          <Alert style={{ marginBottom: 16 }} message={props.errorText} type="error" showIcon />
        ) : null}
        {props.submitted ? (
          <Result
            status="success"
            title="Success"
            subTitle={props.successText ?? 'Successfully submitted'}
            extra={[
              <Button style={{ minWidth: 80 }} onClick={props.close} type="primary" key="ok">
                Ok
              </Button>,
            ]}
          />
        ) : (
          <Form
            onValuesChange={() => props.onChange?.(form.getFieldsValue())}
            form={form}
            initialValues={initialValues}
            layout="vertical"
          >
            {props.children}
          </Form>
        )}
      </Spin>
    </Modal>
  );
}

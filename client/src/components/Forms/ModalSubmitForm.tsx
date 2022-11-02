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

export function ModalSubmitForm({
  data,
  title,
  submit,
  close,
  onChange,
  getInitialValues,
  children,
  loading,
  submitted,
  successText,
  errorText,
}: Props) {
  if (data == null) {
    return null;
  }

  const [form] = Form.useForm();
  const initialValues = getInitialValues ? getInitialValues?.(data) : data;
  
  return (
    <Modal
      visible={true}
      footer={submitted ? null : undefined}
      title={title}
      okText="Submit"
      onOk={async e => {
        e.preventDefault();
        const values = await form.validateFields().catch(() => null);
        if (values == null) {
          return;
        }
        submit(values);
      }}
      onCancel={e => {
        close(e);
        form.resetFields();
      }}
    >
      <Spin spinning={loading ?? false}>
        {errorText ? <Alert style={{ marginBottom: 16 }} message={errorText} type="error" showIcon /> : null}
        {submitted ? (
          <Result
            status="success"
            title="Success"
            subTitle={successText ?? 'Successfully submitted'}
            extra={[
              <Button style={{ minWidth: 80 }} onClick={close} type="primary" key="ok">
                Ok
              </Button>,
            ]}
          />
        ) : (
          <Form
            onValuesChange={() => onChange?.(form.getFieldsValue())}
            form={form}
            initialValues={initialValues}
            layout="vertical"
          >
            {children}
          </Form>
        )}
      </Spin>
    </Modal>
  );
}

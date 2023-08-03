import { Alert, Button, Form, Modal, Result, Spin } from 'antd';
import { useEffect } from 'react';
type Props = {
  data: any;
  title?: string;
  submit: (arg: any) => void;
  close: (arg: any) => void;
  onChange?: (values: any) => void;
  getInitialValues?: (arg: any) => any;
  children: React.ReactNode;
  loading?: boolean;
  submitted?: boolean;
  successText?: string;
  errorText?: string;
  open?: boolean;
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
  open,
}: Props) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (data?.selectedSolutionUrl !== undefined) {
      form.setFieldsValue({ url: data.selectedSolutionUrl });
    }
  }, [data?.selectedSolutionUrl]);

  if (data == null) {
    return null;
  }

  const initialValues = getInitialValues ? getInitialValues?.(data) : data;

  function onSubmit(): ((e: React.MouseEvent<HTMLElement, MouseEvent>) => void) | undefined {
    return async e => {
      e.preventDefault();
      const values = await form.validateFields().catch(() => null);
      if (values == null) {
        return;
      }
      submit(values);
    };
  }

  const onClose = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    close(e);
    form.resetFields();
  };

  return (
    <Modal
      open={open ?? true}
      footer={submitted ? null : undefined}
      title={title}
      okText="Submit"
      onOk={onSubmit()}
      onCancel={onClose}
    >
      <Spin spinning={loading ?? false}>
        {errorText ? <Alert style={{ marginBottom: 16 }} message={errorText} type="error" showIcon /> : null}
        {submitted ? (
          <Result
            status="success"
            title="Success"
            subTitle={successText ?? 'Successfully submitted'}
            extra={[
              <Button style={{ minWidth: 80 }} onClick={onClose} type="primary" key="ok">
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

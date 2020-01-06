import { Form, Modal } from 'antd';
import * as React from 'react';
import { FormInstance } from 'antd/lib/form';

type Props = {
  data: any;
  title?: string;
  form: FormInstance;
  submit: (arg: any) => void;
  cancel: (arg: any) => void;
  getInitialValues: (arg: any) => any;
  children: any;
};
export function ModalForm(props: Props) {
  if (props.data == null) {
    return null;
  }
  const initialValues = props.getInitialValues(props.data);
  return (
    <Modal
      style={{ top: 20 }}
      visible={true}
      title={props.title}
      okText="Save"
      onOk={props.submit}
      onCancel={props.cancel}
    >
      <Form form={props.form} initialValues={initialValues} layout="vertical">
        {props.children}
      </Form>
    </Modal>
  );
}

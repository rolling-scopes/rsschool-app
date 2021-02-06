import * as React from 'react';
import { Button, Form, Divider, Card } from 'antd';
import { SaveOutlined, ClearOutlined } from '@ant-design/icons';

const { Item } = Form;

type Props = {
  data: object;
  name: string;
  title?: string;
  submitFunc: (data: any) => void;
  content: React.ReactNode
};

export default function FormCV(props: Props) {
  const { data, name, title, content, submitFunc } = props;

  const [form] = Form.useForm();

  const formValues = {
    ...data
  };

  React.useEffect(() => {
    form.setFieldsValue(formValues);
  }, [data]);

  const sumbitData = (values: FormData) => {

    const dataObj = {
      type: name,
      data: values
    };

    submitFunc(dataObj);
  };

  return (
    <>
      <Card title={title}>
        <Form form={form} name={name} onFinish={sumbitData}>
          {content}
          <Item>
            <Button style={{ borderRadius: '15px' }} type="primary" size="small" htmlType="submit" icon={<SaveOutlined />}>
              Save
        </Button>
            <Button style={{ borderRadius: '15px' }} type="primary" danger size="small" htmlType="button" onClick={() => form.resetFields()} icon={<ClearOutlined />}>
              Reset fields
        </Button>
          </Item>
        </Form>
      </Card>
    </>
  );
}

import { Col, Form, Input, Modal, Row } from 'antd';

type Props = {
  title: string;
  visible: boolean;
  onCancel: () => void;
  onOk: (text: string) => void;
  initialValue?: string;
  availableEmptyComment?: boolean;
};

export function CommentModal(props: Props) {
  const [form] = Form.useForm();

  const onOk = async () => {
    try {
      await form.validateFields();
      const comment = form.getFieldValue('comment');
      props.onOk(comment);
    } catch {
      return;
    }
  };

  return (
    <Modal title={props.title} open={props.visible} onOk={onOk} onCancel={props.onCancel}>
      <Form form={form} layout="vertical" initialValues={{ comment: props.initialValue ?? '' }}>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              name="comment"
              rules={[
                { required: props.availableEmptyComment === true ? false : true, message: 'Please enter comment' },
              ]}
              label="Comment"
            >
              <Input.TextArea style={{ height: 200 }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

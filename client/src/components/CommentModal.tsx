import { Col, Form, Input, Modal, Row } from 'antd';
import { useForm } from 'antd/lib/form/util';

type Props = {
  title: string;
  visible: boolean;
  onCancel: () => void;
  onOk: (text: string) => void;
};

export function CommentModal(props: Props) {
  const [form] = useForm();

  return (
    <Modal
      title={props.title}
      visible={props.visible}
      onOk={() => props.onOk(form.getFieldValue('comment'))}
      onCancel={props.onCancel}
    >
      <Form form={form} layout="vertical" initialValues={{ comment: '' }}>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item name="comment" rules={[{ required: true, message: 'Please enter comment' }]} label="Comment">
              <Input.TextArea style={{ height: 200 }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

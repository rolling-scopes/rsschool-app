import { WarningOutlined } from '@ant-design/icons';
import { Divider, Modal, theme, Typography, Checkbox, Space, Form, Input } from 'antd';


const { Title, Paragraph } = Typography;

type SurveyResponses = {
  reasonForLeaving?: string[];
  otherComments?: string;
};

type StudentLeaveCourseProps = {
  isOpen: boolean;
  onOk: (surveyData: SurveyResponses) => void;
  onCancel: () => void;
  confirmLoading?: boolean;
};

const messages = ['Are you sure you want to leave the course?', 'Your learning will be stopped.'];

export default function StudentLeaveCourse({ isOpen, onOk, onCancel, confirmLoading }: StudentLeaveCourseProps) {
  const {
    token: { colorError },
  } = theme.useToken();
  const [form] = Form.useForm();

  const handleOkClick = () => {
    form
      .validateFields()
      .then(values => {
        onOk(values);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ color: colorError, margin: 0 }}>
          <WarningOutlined style={{ marginRight: 8 }} />
          Confirm Leaving Course
        </Title>
      }
      open={isOpen}
      onOk={handleOkClick}
      okText="Leave Course"
      okButtonProps={{ danger: true, loading: confirmLoading }}
      onCancel={onCancel}
      cancelText="Continue studying"
    >
      <>
        {messages.map((text, i) => (
          <Paragraph key={i}>{text}</Paragraph>
        ))}

        <Divider />
        <Form form={form} layout="vertical" name="survey_form">
          <Form.Item
            name="reasonForLeaving"
            label="Why are you leaving the course?"
            rules={[{ required: true, message: 'Please select at least one reason.' }]} >
            <Checkbox.Group>
              <Space direction="vertical">
                <Checkbox value="too_difficult">
                  Course was too difficult
                  <br />
                  Курс был слишком сложным
                </Checkbox>
                <Checkbox value="not_useful">
                  Course was not useful
                  <br />
                  Курс был бесполезным
                </Checkbox>
                <Checkbox value="lack_of_time">
                  Lack of time
                  <br />
                  Нехватка времени
                </Checkbox>
                <Checkbox value="other">
                  Other
                  <br />
                  Другое
                </Checkbox>
              </Space>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item
            name="otherComments"
            label="Any other comments or suggestions?"
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter your feedback here..."
            />
          </Form.Item>
        </Form>
      </>
    </Modal>
  );
}
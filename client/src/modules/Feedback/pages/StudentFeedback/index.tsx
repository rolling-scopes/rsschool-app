import { Alert, Button, Col, Form, Input, message, Radio, Rate, Row, Typography } from 'antd';
import { PageLayoutSimple } from 'components/PageLayout';
import { UserSearch } from 'components/UserSearch';
import { useMemo } from 'react';
import { StudentsService } from 'services/students';
import { softSkills } from '../../data/softSkills';

type Props = {
  student: any;
  session: { githubId: string };
};

export function StudentFeedback(props: Props) {
  const { githubId } = props.session;
  const { student } = props;
  const [form] = Form.useForm();

  const service = useMemo(() => new StudentsService(), []);
  const selected = student?.githubId;

  const handleSubmit = async (values: any) => {
    try {
      await service.createFeedback(student.id, values);
    } catch (e) {
      message.error('Error occurred while creating feedback. Please try later.');
    }
  };

  return (
    <PageLayoutSimple title="Student Feedback" loading={false} githubId={githubId}>
      <Alert
        showIcon
        type="info"
        message={
          <>
            <div>This feedback is very important for RS School process.</div>
            <div>Please spend 5 minutes to complete it. Thank you!</div>
          </>
        }
      />
      <Form style={{ margin: '24px 0' }} onFinish={handleSubmit} form={form} layout="vertical">
        <Form.Item label="Student">
          <UserSearch
            allowClear={false}
            clearIcon={false}
            value={selected}
            defaultValues={[student]}
            keyField="githubId"
          />
        </Form.Item>
        <Form.Item name="impression" required label="General Impression">
          <Input.TextArea rows={7} />
        </Form.Item>
        <Form.Item name="gaps" label="Gaps">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Typography.Title level={5}>Recommendation</Typography.Title>
        <Form.Item name="recommendation" required>
          <Radio.Group>
            <Radio.Button value="true">Hire</Radio.Button>
            <Radio.Button value="false">Not Hire</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="recommendationComment" label="Comment">
          <Input.TextArea placeholder="Please tell us why you made such recommendation" rows={3} />
        </Form.Item>
        <Typography.Title level={5}>English</Typography.Title>
        <Form.Item label="Approximate English level" name="englishLevel">
          <Rate />
        </Form.Item>
        <Typography.Title level={5}>Soft Skills</Typography.Title>
        <Row wrap={true}>
          {softSkills.map(({ id, name }) => (
            <Col key={id} span={12}>
              <Form.Item key={id} label={name} name={id}>
                <Rate />
              </Form.Item>
            </Col>
          ))}
        </Row>
        <Button htmlType="submit" type="primary">
          Submit
        </Button>
      </Form>
    </PageLayoutSimple>
  );
}

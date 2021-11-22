import { Alert, Button, Col, Form, Input, Radio, Rate, Row, Typography } from 'antd';
import { PageLayoutSimple } from 'components/PageLayout';
import { UserSearch } from 'components/UserSearch';
import { Session } from 'components/withSession';
import { Course } from 'services/models';
import { softSkills } from '../../data/softSkills';

export type Props = {
  courses?: Course[];
  session: Session;
  courseAlias?: string;
};

export function StudentFeedback(props: Props) {
  const { githubId } = props.session;
  const [form] = Form.useForm();

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
      <Form style={{ margin: '24px 0' }} form={form} layout="vertical">
        <Form.Item name="githubId" label="Student" rules={[{ required: true, message: 'Please select a student' }]}>
          <UserSearch defaultValues={[{ githubId: 'apalchys', id: 1, name: 'Andrei Palchys' }]} keyField="githubId" />
        </Form.Item>
        <Form.Item name="summary.impression" required label="General Impression">
          <Input.TextArea rows={7} />
        </Form.Item>
        <Form.Item name="summary.gaps" label="Gaps">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item label="Knowledge Level" name="summary.knowledge">
          <Rate />
        </Form.Item>
        <Typography.Title level={5}>Recommendation</Typography.Title>
        <Form.Item name="recommendation.decision" required>
          <Radio.Group>
            <Radio.Button value="true">Hire</Radio.Button>
            <Radio.Button value="false">Not Hire</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="recommendation.comment" label="Comment">
          <Input.TextArea placeholder="Please tell us why you made such recommendation" rows={3} />
        </Form.Item>
        <Typography.Title level={5}>English</Typography.Title>
        <Form.Item label="Approximate English level" name="skills.language.english">
          <Rate />
        </Form.Item>
        <Typography.Title level={5}>Soft Skills</Typography.Title>
        <Row wrap={true}>
          {softSkills.map(({ id, name }) => (
            <Col span={12}>
              <Form.Item key={id} label={name} name={id}>
                <Rate />
              </Form.Item>
            </Col>
          ))}
        </Row>
        <Button type="primary">Submit</Button>
      </Form>
    </PageLayoutSimple>
  );
}

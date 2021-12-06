import { Alert, Button, Col, Form, Input, message, Radio, Rate, Row, Typography } from 'antd';
import { MentorsApi, MentorStudentDto, StudentsFeedbacksApi } from 'api';
import { PageLayoutSimple } from 'components/PageLayout';
import { UserSearch } from 'components/UserSearch';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CoursePageProps } from 'services/models';
import { softSkills } from '../../data/softSkills';

export function StudentFeedback({ session, course }: CoursePageProps) {
  const { githubId } = session;
  const { id: courseId } = course;
  const mentorId = Number(session.courses[courseId].mentorId);
  const [form] = Form.useForm();
  const router = useRouter();
  const [noData, setNoData] = useState(false);
  const [students, setStudents] = useState<MentorStudentDto[]>([]);
  const service = useMemo(() => new StudentsFeedbacksApi(undefined, ''), []);
  const mentorsService = useMemo(() => new MentorsApi(undefined, ''), []);

  useAsync(async () => {
    const { data: students } = await mentorsService.getMentorStudents(mentorId);
    if (students.length === 0) {
      setNoData(true);
      return;
    }
    setStudents(students);
    const studentId = router.query['studentId'] ? Number(router.query['studentId']) : null;
    form.setFieldsValue({ studentId });
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      const { studentId, ...rest } = values;
      await service.createStudentFeedback(studentId, rest);
    } catch (e) {
      message.error('Error occurred while creating feedback. Please try later.');
    }
  };

  return (
    <PageLayoutSimple noData={noData} title="Student Feedback" loading={false} githubId={githubId}>
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
        <Form.Item name="studentId" label="Student">
          <UserSearch allowClear={false} clearIcon={false} defaultValues={students} keyField="id" />
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

import { Alert, Button, Col, Form, Input, message, Radio, Rate, Row, Typography } from 'antd';
import {
  CreateStudentFeedbackDtoEnglishLevelEnum as EnglishLevelEnum,
  CreateStudentFeedbackDtoRecommendationEnum as RecommendationEnum,
  StudentsFeedbacksApi,
} from 'api';
import { PageLayoutSimple } from 'components/PageLayout';
import { UserSearch } from 'components/UserSearch';
import { useMentorStudents } from 'modules/Mentor/hooks/useMentorStudents';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { getApiCfg } from 'services/api';
import { CoursePageProps } from 'services/models';
import { softSkills } from '../../data/softSkills';

type FormValues = {
  studentId: number;
  impression: string;
  recommendation: RecommendationEnum;
  gaps: string;
  recommendationComment: string;
  englishLevelIndex: number;
};

const englishLevels = [
  EnglishLevelEnum.A1,
  EnglishLevelEnum.A2,
  EnglishLevelEnum.B1,
  EnglishLevelEnum.B2,
  EnglishLevelEnum.C1,
  EnglishLevelEnum.C2,
];

export function StudentFeedback({ session, course }: CoursePageProps) {
  const { githubId, courses } = session;
  const { id: courseId, alias } = course;
  const mentorId = Number(courses[courseId].mentorId);

  const [form] = Form.useForm();
  const router = useRouter();

  const [students, loading] = useMentorStudents(mentorId);
  const service = useMemo(() => new StudentsFeedbacksApi(getApiCfg()), []);
  const noData = students?.length === 0;

  useEffect(() => {
    if (noData) {
      return;
    }
    const studentId = router.query['studentId'] ? Number(router.query['studentId']) : null;
    form.setFieldsValue({ studentId });
  }, [students]);

  const handleSubmit = async (values: FormValues) => {
    try {
      const { studentId, ...rest } = values;
      await service.createStudentFeedback(studentId, {
        recommendation: rest.recommendation,
        content: {
          gaps: rest.gaps,
          impression: rest.impression,
          recommendationComment: rest.recommendationComment,
          softSkills: [],
        },
        englishLevel: rest.englishLevelIndex != null ? englishLevels[rest.englishLevelIndex] : EnglishLevelEnum.Unknown,
      });
      message.success('Feedback successfully sent');
      router.push(`/course/mentor/students?course=${alias}`);
    } catch (e) {
      message.error('Error occurred while creating feedback. Please try later.');
    }
  };

  return (
    <PageLayoutSimple noData={noData} title="Student Feedback" loading={loading} githubId={githubId}>
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
            <Radio.Button value={RecommendationEnum.Hire}>Hire</Radio.Button>
            <Radio.Button value={RecommendationEnum.NotHire}>Not Hire</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="recommendationComment" required label="Comment">
          <Input.TextArea placeholder="Please tell us why you made such recommendation" rows={3} />
        </Form.Item>
        <Typography.Title level={5}>English</Typography.Title>
        <Form.Item label="Approximate English level" name="englishLevelIndex">
          <Rate tooltips={englishLevels} count={englishLevels.length} />
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

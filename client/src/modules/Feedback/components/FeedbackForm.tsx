import { Alert, Button, Col, Form, Input, message, Radio, Rate, Row, Typography } from 'antd';
import {
  CreateStudentFeedbackDto,
  CreateStudentFeedbackDtoEnglishLevelEnum as EnglishLevelEnum,
  MentorStudentDto,
  CreateStudentFeedbackDtoRecommendationEnum as RecommendationEnum,
  SoftSkillEntryIdEnum,
} from 'api';
import { UserSearch } from 'components/UserSearch';
import { useEffect } from 'react';
import { convertSoftSkillValueToEnum, softSkills, softSkillValues } from '../data/softSkills';
import { useRouter } from 'next/router';

type FormValues = Record<SoftSkillEntryIdEnum, number> & {
  studentId: number;
  suggestions: string;
  recommendation: RecommendationEnum;
  recommendationComment: string;
  englishLevel: EnglishLevelEnum;
};

const englishLevels = [
  EnglishLevelEnum.A1,
  EnglishLevelEnum.A2,
  EnglishLevelEnum.B1,
  EnglishLevelEnum.B2,
  EnglishLevelEnum.C1,
  EnglishLevelEnum.C2,
];

type FeedbackFormProps = {
  studentId: number;
  students?: MentorStudentDto[];
  onSubmit: (studentId: number, payload: CreateStudentFeedbackDto, existingFeedbackId?: number) => Promise<void>;
};

const { TextArea } = Input;

const getInitialValues = (studentId: number, students: MentorStudentDto[] | undefined): FormValues | undefined => {
  const selectedStudent = students?.find(student => student.id === studentId);
  if (selectedStudent) {
    const feedback = selectedStudent.feedbacks[0];
    if (feedback) {
      return {
        studentId,
        suggestions: feedback.content.suggestions,
        recommendation: feedback.recommendation,
        recommendationComment: feedback.content.recommendationComment,
        englishLevel: feedback.englishLevel,
        ...feedback.content.softSkills.reduce(
          (acc, { id, value }) => {
            acc[id as SoftSkillEntryIdEnum] = softSkillValues[value];
            return acc;
          },
          {} as Record<SoftSkillEntryIdEnum, number>,
        ),
      };
    }
  }
  return { studentId } as FormValues;
};

export const FeedbackForm = ({ studentId, onSubmit, students }: FeedbackFormProps) => {
  const router = useRouter();
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    const initialValues = getInitialValues(studentId, students);
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [studentId, students, form]);

  const handleStudentChange = (value: string) => {
    const newStudentId = Number(value);
    const initialValues = getInitialValues(newStudentId, students);
    if (initialValues) {
      form.resetFields();
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
      form.setFieldsValue({ studentId: newStudentId });
    }
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, studentId: newStudentId },
      },
      undefined,
      { shallow: true },
    );
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      const { studentId, ...rest } = values;

      const payload: CreateStudentFeedbackDto = {
        recommendation: rest.recommendation,
        content: {
          suggestions: rest.suggestions ?? '',
          recommendationComment: rest.recommendationComment,
          softSkills: softSkills.map(({ id }) => ({ id, value: convertSoftSkillValueToEnum(rest[id]) })),
        },
        englishLevel: rest.englishLevel ? rest.englishLevel : EnglishLevelEnum.Unknown,
      };

      const selectedStudent = students?.find(student => student.id === studentId);
      const existingFeedback = selectedStudent?.feedbacks[0];

      await onSubmit(studentId, payload, existingFeedback ? existingFeedback.id : undefined);
    } catch (e) {
      message.error('Error occurred while creating feedback. Please try later.');
    }
  };

  return (
    <Form
      style={{ margin: '24px 0' }}
      onFinish={handleSubmit}
      form={form}
      layout="vertical"
      initialValues={{ studentId }}
    >
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
      <Alert
        style={{ marginTop: 8 }}
        showIcon
        type="warning"
        message={
          <div>If you recommend to "Hire", we will attach the feedback to student's CV and it will be public.</div>
        }
      />
      <Form.Item name="studentId" label="Student">
        <UserSearch allowClear={false} defaultValues={students} keyField="id" onChange={handleStudentChange} />
      </Form.Item>
      <Typography.Title level={5}>Recommended To</Typography.Title>
      <Form.Item name="recommendation" rules={[{ required: true, message: 'Required' }]}>
        <Radio.Group>
          <Radio.Button value={RecommendationEnum.Hire}>Hire</Radio.Button>
          <Radio.Button value={RecommendationEnum.NotHire}>Not Hire</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item name="recommendationComment" rules={[{ required: true, message: 'Required' }]} label="What was good">
        <TextArea rows={7} allowClear />
      </Form.Item>
      <Form.Item name="suggestions" label="What could be improved">
        <TextArea rows={3} allowClear />
      </Form.Item>
      <Typography.Title level={5}>English</Typography.Title>
      <Form.Item label="Approximate English level" name="englishLevel">
        <Radio.Group>
          {englishLevels.map(level => (
            <Radio.Button key={level} value={level}>
              {level.toUpperCase()}
            </Radio.Button>
          ))}
        </Radio.Group>
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
  );
};

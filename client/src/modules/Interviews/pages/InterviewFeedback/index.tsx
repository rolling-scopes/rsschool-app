import { Button, Checkbox, Form, Input, message, Rate, Space, Typography } from 'antd';
import { AxiosError } from 'axios';
import { CommentInput } from 'components/Forms';
import { GithubAvatar } from 'components/GithubAvatar';
import { PageLayoutSimple } from 'components/PageLayout';
import { InputType, templates } from 'data/interviews';
import _ from 'lodash';
import { SessionContext } from 'modules/Course/contexts';
import { useRouter } from 'next/router';
import { Fragment, useContext, useMemo, useState } from 'react';
import { CourseService } from 'services/course';
import type { PageProps } from './getServerSideProps';

type FormAnswer = {
  questionId: string;
  questionText: string;
  answer: string;
};

export function InterviewFeedback({ course, type, interviewId }: PageProps) {
  const courseId = course.id;
  const router = useRouter();
  const session = useContext(SessionContext);
  const template = templates[type];
  const githubId = router.query.githubId as string;

  const [form] = Form.useForm();

  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const [loading, setLoading] = useState(false);

  const questions = useMemo(() => template.categories.flatMap(c => c.questions), [type]);

  const handleSubmit = async (values: any) => {
    if (!githubId || loading) {
      return;
    }
    try {
      setLoading(true);
      const formAnswers: FormAnswer[] = questions.map(({ id, name }) => ({
        answer: values[id],
        questionId: id.toString(),
        questionText: name,
      }));
      const score = Number(values.score) - 1;
      const body = { formAnswers, score, comment: values.comment || '' };
      await courseService.postStudentInterviewResult(githubId, interviewId, body);
      message.success('You interview feedback has been submitted. Thank you.');
      form.resetFields();
    } catch (e) {
      const error = e as AxiosError<any>;
      const response = error.response;
      const errorMessage = response?.data?.data?.message ?? 'An error occurred. Please try later.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayoutSimple
      loading={loading}
      title={`${template.name}: Interview Feedback`}
      courseName={course.name}
      githubId={session.githubId}
    >
      <Typography style={{ marginBottom: 24 }}>
        <h4>Process</h4>
        <div>
          <a target="_blank" href={template.examplesUrl}>
            Sample interview questions ({template.examplesUrl})
          </a>
        </div>
        <div>1) Ask a question </div>
        <div>2) Listen for the answer </div>
        <div>3) Complete or correct the answer if needed</div>
        <div>4) Ask the next question</div>
      </Typography>

      <Typography>
        <div style={{ marginBottom: 8 }} dangerouslySetInnerHTML={{ __html: template.descriptionHtml ?? '' }} />
      </Typography>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onFinishFailed={({ errorFields: [errorField] }) => form.scrollToField(errorField.name)}
      >
        <Space align="baseline">
          <Typography.Title level={4}>Student: </Typography.Title>{' '}
          <GithubAvatar githubId={githubId ?? undefined} size={24} />
          <Typography.Link target="_blank" href={`/profile?githubId=${githubId}`}>
            <Typography.Title level={4}>
              <Typography.Link>{githubId}</Typography.Link>
            </Typography.Title>
          </Typography.Link>
        </Space>

        {template.categories.map(category => (
          <Fragment key={category.id}>
            <Typography.Title level={4}>
              {category.name}
              {category.description ? <Typography.Title level={5}>{category.description}</Typography.Title> : null}
            </Typography.Title>
            {category.questions.map(question => {
              switch (question.type) {
                case InputType.Input:
                  return (
                    <Form.Item label={question.name} name={question.id} key={question.id}>
                      <Input.TextArea rows={4} />
                    </Form.Item>
                  );
                default:
                  return (
                    <Form.Item
                      style={{ marginBottom: 16 }}
                      name={question.id}
                      key={question.id}
                      valuePropName="checked"
                    >
                      <Checkbox>{question.name}</Checkbox>
                    </Form.Item>
                  );
              }
            })}
          </Fragment>
        ))}
        <Typography.Title level={4}>Total score</Typography.Title>
        <Form.Item name="score" label="Score" rules={[{ required: true, message: 'Please set Score' }]}>
          <Rate
            count={11}
            tooltips={['0 (No Interview, Rejected etc.)'].concat(_.range(1, 11).map(_.toString))}
            style={{ marginBottom: '5px' }}
          />
        </Form.Item>
        <Typography.Title level={4}>Comment</Typography.Title>
        <CommentInput />
        <Button size="large" type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
    </PageLayoutSimple>
  );
}

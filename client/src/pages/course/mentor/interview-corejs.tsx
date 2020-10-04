import { Button, Checkbox, Form, Input, message, Rate, Typography } from 'antd';
import _ from 'lodash';
import { UserSearch, PageLayoutSimple } from 'components';
import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { useMemo, useState, useEffect } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { CoursePageProps, StudentBasic } from 'services/models';
import { CommentInput } from 'components/Forms';
import { AxiosError } from 'axios';

interface Record {
  questionId: string;
  questionText: string;
  answer: string;
}

const questions: { questionId: string; questionText: string }[] = [
  { questionId: 'let-const', questionText: 'let vs const vs var' },
  { questionId: 'hoisting', questionText: 'Understanding of hoisting' },
  { questionId: 'closure', questionText: 'Understanding of closure' },
  { questionId: 'scope', questionText: 'Understanding of scope' },

  { questionId: 'capturing', questionText: 'Capturing' },
  { questionId: 'bubbling', questionText: 'Bubbling' },
  { questionId: 'event-delegation', questionText: 'Event Delegation' },
  { questionId: 'event-prevention', questionText: 'PreventDefault, stopPropagation, stopImmediatePropagation' },
  { questionId: 'event-listener', questionText: 'addEventListener' },

  { questionId: 'eventloop', questionText: 'What is Event Loop' },
  { questionId: 'set-timeout', questionText: 'setTimeout(()=>alert("hello",0));' },
  { questionId: 'promises-microtask', questionText: 'Promises & Microtasks' },

  { questionId: 'call-bind-apply', questionText: 'Knowledge of this/apply/call/bind' },
  { questionId: 'inheritance', questionText: 'Knowledge of inheritance and classes' },
];

const section1 = ['let-const', 'hoisting', 'closure', 'scope'];
export const section2 = ['capturing', 'bubbling', 'event-delegation', 'event-prevention', 'event-listener'];
export const section3 = ['eventloop', 'async', 'promises-microtask'];

export const initialValues: any = {
  'call-bind-apply': '',
  'event-delegation': false,
  'event-listener': false,
  'event-prevention': false,
  'let-const': false,
  'promises-microtask': false,
  'set-timeout': false,
  bubbling: false,
  capturing: false,
  closure: false,
  comment: '',
  eventloop: false,
  hoisting: false,
  inheritance: '',
  scope: false,
  score: null,
};

function Page(props: CoursePageProps) {
  const courseId = props.course.id;

  const [githubId] = useState(window ? new URLSearchParams(window.location.search).get('githubId') : null);
  const [form] = Form.useForm();
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([] as StudentBasic[]);
  const [courseTaskId, setCourseTaskId] = useState(null as number | null);

  useEffect(() => {
    form.setFieldsValue({ githubId });
  }, [githubId]);

  useAsync(async () => {
    const courseTasks = await courseService.getCourseTasks();
    const courseTask = courseTasks.find((courseTask) => courseTask.type === 'interview');
    if (!courseTask) {
      return;
    }
    const students = await courseService.getInterviewStudents(courseTask.id);
    setStudents(students);
    setCourseTaskId(courseTask.id);
  });

  const handleSubmit = async (values: any) => {
    if (!values.githubId || loading) {
      return;
    }
    try {
      setLoading(true);
      const formAnswers: Record[] = questions.map(({ questionId, questionText }) => ({
        answer: values[questionId],
        questionId: questionId,
        questionText: questionText,
      }));
      const score = Number(values.score) - 1;
      const body = { formAnswers, score, comment: values.comment || '' };
      await courseService.postStudentInterviewResult(values.githubId, courseTaskId!, body);
      message.success('You interview feedback has been submitted. Thank you.');
      form.resetFields();
    } catch (e) {
      const error = e as AxiosError;
      const response = error.response;
      const errorMessage = response?.data?.data?.message ?? 'An error occurred. Please try later.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async (searchText: string) => {
    return students.filter(({ githubId, name }) => `${githubId} ${name}`.match(searchText));
  };

  return (
    <PageLayoutSimple
      loading={loading}
      title="CoreJS: Interview Feedback"
      courseName={props.course.name}
      githubId={props.session.githubId}
    >
      <Typography style={{ marginBottom: 24 }}>
        <h4>Process</h4>
        <div>
          <a
            target="_blank"
            href="https://github.com/rolling-scopes-school/tasks/blob/master/tasks/interview-corejs.md"
          >
            Sample interview questions
            (https://github.com/rolling-scopes-school/tasks/blob/master/tasks/interview-corejs.md)
          </a>
        </div>
        <div>1) Ask a question </div>
        <div>2) Listen for the answer </div>
        <div>3) Complete or correct the answer if needed</div>
        <div>4) Ask the next question</div>
      </Typography>

      <Form
        form={form}
        initialValues={initialValues}
        layout="vertical"
        onFinish={handleSubmit}
        onFinishFailed={({ errorFields: [errorField] }) => form.scrollToField(errorField.name)}
      >
        <Typography.Title level={4}>Student</Typography.Title>
        <Form.Item name="githubId" label="Student" rules={[{ required: true, message: 'Please select a student' }]}>
          <UserSearch keyField="githubId" defaultValues={students} searchFn={loadStudents} />
        </Form.Item>

        <Typography.Title level={4}>Variables, Hoisting, Closures</Typography.Title>
        {questions
          .filter((question) => section1.includes(question.questionId))
          .map((question) => (
            <Form.Item name={question.questionId} key={question.questionId} valuePropName="checked">
              <Checkbox>{question.questionText}</Checkbox>
            </Form.Item>
          ))}
        <Typography.Title level={4}>Knowledge of this/apply/call/bind</Typography.Title>
        <Form.Item name="call-bind-apply">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Typography.Title level={3}>Knowledge of the Dom Events</Typography.Title>
        {questions
          .filter((question) => section2.includes(question.questionId))
          .map((question) => (
            <Form.Item name={question.questionId} key={question.questionId} valuePropName="checked">
              <Checkbox>{question.questionText}</Checkbox>
            </Form.Item>
          ))}
        <Typography.Title level={4}>Knowledge of the Event Loop</Typography.Title>
        {questions
          .filter((question) => section3.includes(question.questionId))
          .map((question) => (
            <Form.Item name={question.questionId} key={question.questionId} valuePropName="checked">
              <Checkbox>{question.questionText}</Checkbox>
            </Form.Item>
          ))}
        <Typography.Title level={4}>Knowledge of inheritance and classes</Typography.Title>
        <Form.Item name="inheritance">
          <Input.TextArea rows={4} />
        </Form.Item>
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

export default withCourseData(withSession(Page, 'mentor'));

import { Button, Checkbox, Form, Input, message, Rate, Typography } from 'antd';
import _ from 'lodash';
import { UserSearch, PageLayoutSimple } from 'components';
import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { useMemo, useState } from 'react';
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
  { questionId: 'hoisting', questionText: 'Понимание hoisting' },
  { questionId: 'closure', questionText: 'Понимание closure' },
  { questionId: 'scope', questionText: 'Понимание scope' },

  { questionId: 'capturing', questionText: 'Capturing' },
  { questionId: 'bubbling', questionText: 'Bubbling' },
  { questionId: 'event-delegation', questionText: 'Event Delegation' },
  { questionId: 'event-prevention', questionText: 'PreventDefault, stopPropagation, stopImmediatePropagation' },
  { questionId: 'event-listener', questionText: 'addEventListener' },

  { questionId: 'eventloop', questionText: 'What is Event Loop' },
  { questionId: 'set-timeout', questionText: 'setTimeout(()=>alert("hello",0));' },
  { questionId: 'promises-microtask', questionText: 'Promises & Microtasks' },

  { questionId: 'call-bind-apply', questionText: 'Знание this/apply/call/bind' },
  { questionId: 'inheritance', questionText: 'Знание наследования и классов' },
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
  score: '0',
};

function Page(props: CoursePageProps) {
  const courseId = props.course.id;

  const [form] = Form.useForm();
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([] as StudentBasic[]);
  const [courseTaskId, setCourseTaskId] = useState(null as number | null);

  useAsync(async () => {
    const courseTasks = await courseService.getCourseTasks();
    const courseTask = courseTasks.find(courseTask => courseTask.type === 'interview');
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
      const score = Number(values.score);
      const body = { formAnswers, score, comment: values.comment || '' };
      await courseService.postStudentInterviewResult(values.githubId, courseTaskId!, body);
      message.success('You interview feedback has been submitted. Thank you.');
      form.resetFields();
    } catch (e) {
      const error = e as AxiosError;
      const meesage = error.response?.data?.data?.message ?? 'An error occurred. Please try later.';
      message.error(meesage);
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
        <h4>Процесс</h4>
        <div>
          <a
            target="_blank"
            href="https://github.com/rolling-scopes-school/tasks/blob/master/tasks/interview-corejs.md"
          >
            Темы для интервью (https://github.com/rolling-scopes-school/tasks/blob/master/tasks/interview-corejs.md)
          </a>
        </div>
        <div>1) Задаете вопрос </div>
        <div>2) Слушаете ответ </div>
        <div>3) Если необходимо, дополняете или исправляете</div>
        <div>4) Задаете следующий вопрос</div>
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
          .filter(question => section1.includes(question.questionId))
          .map(question => (
            <Form.Item name={question.questionId} key={question.questionId} valuePropName="checked">
              <Checkbox>{question.questionText}</Checkbox>
            </Form.Item>
          ))}
        <Typography.Title level={4}>Знание this/apply/call/bind</Typography.Title>
        <Form.Item name="call-bind-apply">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Typography.Title level={3}>Знание Dom Events</Typography.Title>
        {questions
          .filter(question => section2.includes(question.questionId))
          .map(question => (
            <Form.Item name={question.questionId} key={question.questionId} valuePropName="checked">
              <Checkbox>{question.questionText}</Checkbox>
            </Form.Item>
          ))}
        <Typography.Title level={4}>Знание Event Loop</Typography.Title>
        {questions
          .filter(question => section3.includes(question.questionId))
          .map(question => (
            <Form.Item name={question.questionId} key={question.questionId} valuePropName="checked">
              <Checkbox>{question.questionText}</Checkbox>
            </Form.Item>
          ))}
        <Typography.Title level={4}>Знание наследования и классов</Typography.Title>
        <Form.Item name="inheritance">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Typography.Title level={4}>Общая оценка</Typography.Title>
        <Form.Item name="score" rules={[{ required: true }]}>
          <Rate count={10} tooltips={_.range(1, 11).map(_.toString)} style={{ marginBottom: '5px' }} />
        </Form.Item>
        <Typography.Title level={4}>Комментарий</Typography.Title>
        <CommentInput />
        <Button size="large" type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
    </PageLayoutSimple>
  );
}

export default withCourseData(withSession(Page, 'mentor'));

import * as React from 'react';
import { FormGroup, Label, Button, Input, Alert, ListGroup, ListGroupItem, ListGroupItemHeading } from 'reactstrap';
import axios from 'axios';
import { Form, Field, SubsetFormApi } from 'react-final-form';

import { Header } from 'components/Header';
import withSession, { Session } from 'components/withSession';
import withCourseData from 'components/withCourseData';
import { ValidationError } from 'components/ValidationError';
import { LoadingScreen } from 'components/LoadingScreen';
import { StudentSelect } from 'components/Forms/StudentSelect';

import { Course, StudentBasic } from 'services/course';
import '../../../index.scss';

type Props = {
  session: Session;
  course: Course;
};

type State = {
  students: StudentBasic[];
  isLoading: boolean;
  submitted: boolean;
  scoreError: boolean;
};

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
  { questionId: 'event-prevention', questionText: 'PreventDefault, stopPropogation, stopImmidiatePropogation' },
  { questionId: 'event-listener', questionText: 'addEventListener' },

  { questionId: 'eventloop', questionText: 'What is Event Loop' },
  { questionId: 'set-timeout', questionText: 'setTimeout(()=>alert("hello",0));' },
  { questionId: 'promises-microtask', questionText: 'Promises & Microtasks' },

  { questionId: 'call-bind-apply', questionText: 'Знание this/apply/call/bind' },
  { questionId: 'inheritance', questionText: 'Знание наследования и классов' },
];

const section1 = ['let-const', 'hoisting', 'closure', 'scope'];
const section2 = ['capturing', 'bubbling', 'event-delegation', 'event-prevention', 'event-listener'];
const section3 = ['eventloop', 'async', 'promises-microtask'];

const initialValues: any = {
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

const COURSE_TASK_ID = 49;

class InterviewFeedbackPage extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
    students: [],
    submitted: false,
    scoreError: false,
  };

  async componentDidMount() {
    const studentsResponse = await axios.get(
      `/api/course/${this.props.course.id}/mentor/otherStudents?courseTaskId=${COURSE_TASK_ID}`,
    );
    const students = studentsResponse.data.data.students;
    this.setState({ students });
  }

  handleSubmit = async (values: any, formApi: SubsetFormApi) => {
    const scoreError = Number(values.score) < 1;
    this.setState({ scoreError, submitted: false });
    if (scoreError) {
      return;
    }

    const formAnswers: Record[] = questions.map(question => ({
      answer: values[question.questionId].toString(),
      questionId: question.questionId,
      questionText: question.questionText,
    }));
    const score = Number(values.score);

    const body = {
      formAnswers,
      score,
      courseTaskId: COURSE_TASK_ID,
      studentId: Number(values.studentId),
      comment: values.comment || '',
    };

    this.setState({ isLoading: true });

    await axios.post(`/api/course/${this.props.course.id}/interviewFeedback`, body);

    formApi.reset();
    this.setState({ submitted: true, isLoading: false });
  };

  render() {
    return (
      <>
        <Header username={this.props.session.githubId} />
        <div className="m-3">
          <h3 className="mb-3">CoreJS: Interview Feedback</h3>

          {this.state.submitted && <Alert color="info">Feedback has been submitted</Alert>}
          <Alert color="dark">
            <h5>Процесс</h5>
            <div>
              <a href="https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/interview-corejs.md">
                Темы для интервью
                (https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/interview-corejs.md)
              </a>
            </div>
            <div>1) Задаете вопрос </div>
            <div>2) Слушаете ответ </div>
            <div>3) Если необходимо, дополняете или исправляете</div>
            <div>4) Задаете следующий вопрос</div>
          </Alert>

          <Form
            onSubmit={this.handleSubmit}
            initialValues={initialValues}
            render={({ handleSubmit }) => (
              <LoadingScreen show={this.state.isLoading}>
                <form className="mt-4" onSubmit={handleSubmit}>
                  <StudentSelect name="studentId" data={this.state.students} />
                  <ListGroup className="mt-4 col-md-10">
                    <ListGroupItem>
                      <ListGroupItemHeading>Variables, Hoisting, Closures</ListGroupItemHeading>
                    </ListGroupItem>
                    {questions
                      .filter(question => section1.includes(question.questionId))
                      .map(question => (
                        <ListGroupItem key={question.questionId}>
                          <Field name={question.questionId} type="checkbox">
                            {({ input }) => (
                              <Label className="ml-4">
                                <Input {...input} type="checkbox" />
                                {question.questionText}
                              </Label>
                            )}
                          </Field>
                        </ListGroupItem>
                      ))}
                  </ListGroup>

                  <ListGroup className="mt-4 col-md-10">
                    <ListGroupItem>
                      <ListGroupItemHeading>Знание this/apply/call/bind</ListGroupItemHeading>
                    </ListGroupItem>
                    <ListGroupItem>
                      <Field name="call-bind-apply">{({ input }) => <Input {...input} type="textarea" />}</Field>
                    </ListGroupItem>
                  </ListGroup>

                  <ListGroup className="mt-4 col-md-10">
                    <ListGroupItem>
                      <ListGroupItemHeading>Знание Dom Events</ListGroupItemHeading>
                    </ListGroupItem>
                    {questions
                      .filter(question => section2.includes(question.questionId))
                      .map(question => (
                        <ListGroupItem key={question.questionId}>
                          <Field name={question.questionId} type="checkbox">
                            {({ input }) => (
                              <Label className="ml-4">
                                <Input {...input} type="checkbox" />
                                {question.questionText}
                              </Label>
                            )}
                          </Field>
                        </ListGroupItem>
                      ))}
                  </ListGroup>

                  <ListGroup className="mt-4 col-md-10">
                    <ListGroupItem>
                      <ListGroupItemHeading>Знание Event Loop</ListGroupItemHeading>
                    </ListGroupItem>
                    {questions
                      .filter(question => section3.includes(question.questionId))
                      .map(question => (
                        <ListGroupItem key={question.questionId}>
                          <Field name={question.questionId} type="checkbox">
                            {({ input }) => (
                              <Label className="ml-4">
                                <Input {...input} type="checkbox" />
                                {question.questionText}
                              </Label>
                            )}
                          </Field>
                        </ListGroupItem>
                      ))}
                  </ListGroup>

                  <ListGroup className="mt-4 col-md-10">
                    <ListGroupItem>
                      <ListGroupItemHeading>Знание наследования и классов</ListGroupItemHeading>
                    </ListGroupItem>
                    <ListGroupItem>
                      <Field name="inheritance">{({ input }) => <Input {...input} type="textarea" />}</Field>
                    </ListGroupItem>
                  </ListGroup>

                  <ListGroup className="mt-4 col-md-10">
                    <ListGroupItem>
                      <ListGroupItemHeading>Общая оценка</ListGroupItemHeading>
                    </ListGroupItem>
                    <ListGroupItem>
                      Ничего не знает
                      <FormGroup check={true} inline={true}>
                        {new Array(10).fill(null).map((_, i) => (
                          <Field key={i} value={`${i + 1}`} name={`score`} type="radio">
                            {({ input }) => (
                              <Label check={true} className="mr-1 ml-1">
                                <Input {...input} type="radio" />
                                {i + 1}
                              </Label>
                            )}
                          </Field>
                        ))}
                      </FormGroup>
                      Отличные знания по всем темам
                      {this.state.scoreError && <ValidationError meta={{ error: 'Required', touched: true }} />}
                    </ListGroupItem>
                  </ListGroup>

                  <ListGroup className="mt-4 col-md-10">
                    <ListGroupItem>
                      <ListGroupItemHeading>Заметки</ListGroupItemHeading>
                    </ListGroupItem>
                    <ListGroupItem>
                      <Field name="comment">{({ input }) => <Input {...input} name="comment" type="textarea" />}</Field>
                    </ListGroupItem>
                  </ListGroup>

                  <div className="form-group col-md-6 text-left">
                    <Button type="submit" color="success">
                      Submit
                    </Button>
                  </div>
                </form>
              </LoadingScreen>
            )}
          />
        </div>
      </>
    );
  }
}

export default withCourseData(withSession(InterviewFeedbackPage, 'mentor'));

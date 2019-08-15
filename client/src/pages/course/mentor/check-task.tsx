import * as React from 'react';
import { Field, Form, SubsetFormApi } from 'react-final-form';
import { Alert, Button, FormGroup, Input, Label } from 'reactstrap';

import { requiredValidator, taskGithubPrValidator } from 'components/Forms';
import { StudentSelect, TextArea } from 'components/Forms';
import { Header } from 'components/Header';
import { LoadingScreen } from 'components/LoadingScreen';
import { ValidationError } from 'components/ValidationError';
import withCourseData from 'components/withCourseData';
import withSession, { Session } from 'components/withSession';
import { Course, CourseService, CourseTask, StudentBasic, AssignedStudent } from 'services/course';
import { sortTasksByEndDate } from 'services/rules';

import '../../../index.scss';

type Props = {
  session: Session;
  course: Course;
};

type State = {
  students: StudentBasic[];
  courseTasks: CourseTask[];
  isLoading: boolean;
  submitted: boolean;
  isPowerMentor: boolean;
};

class TaskScorePage extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
    isPowerMentor: false,
    students: [],
    courseTasks: [],
    submitted: false,
  };

  allStudents: {
    students: StudentBasic[];
    assignedStudents: AssignedStudent[];
  } | null = null;
  courseService = new CourseService();

  async componentDidMount() {
    const courseId = this.props.course.id;
    const { isAdmin, roles } = this.props.session;
    const isCourseManager = roles[courseId] === 'coursemanager';
    const isPowerMentor = isAdmin || isCourseManager;

    const students = isPowerMentor
      ? this.courseService.getCourseStudents(courseId).then(students => ({
          students,
          assignedStudents: [],
        }))
      : this.courseService.getAllMentorStudents(courseId);
    const [allStudents, courseTasks] = await Promise.all([students, this.courseService.getCourseTasks(courseId)]);
    this.allStudents = allStudents;

    const filteredCourseTasks = courseTasks
      .sort(sortTasksByEndDate)
      .filter(task => task.studentEndDate && task.verification !== 'auto' && !task.useJury);

    this.setState({ isPowerMentor, courseTasks: filteredCourseTasks });
  }

  onChangeTask = async (value: any) => {
    const courseTaskId = Number(value);
    const courseTask = this.state.courseTasks.find(t => t.courseTaskId === courseTaskId);
    if (courseTask == null || this.allStudents == null) {
      return;
    }
    if (this.state.isPowerMentor) {
      this.setState({ students: this.allStudents.students });
      return;
    }
    if (courseTask.checker !== 'mentor') {
      this.setState({
        students: this.allStudents.assignedStudents
          .filter(s => s.courseTaskId === courseTaskId)
          .filter(student => student.isActive),
      });
      return;
    }
    this.setState({
      students: this.allStudents.students.filter(student => student.isActive),
    });
  };

  handleSubmit = async (values: any, formApi: SubsetFormApi) => {
    this.setState({ isLoading: true });
    try {
      const courseId = this.props.course.id;
      const { studentId, ...data } = values;
      this.courseService.postStudentScore(courseId, studentId, data);

      formApi.reset();
      this.setState({ submitted: true, isLoading: false });
    } catch (e) {
      this.setState({ submitted: false, isLoading: false });
    }
  };

  render() {
    return (
      <>
        <Header title="Check Task" courseName={this.props.course.name} username={this.props.session.githubId} />
        <div className="m-3">
          {this.state.submitted && <Alert color="info">Score has been submitted</Alert>}

          <Form
            onSubmit={this.handleSubmit}
            render={({ handleSubmit }) => (
              <LoadingScreen show={this.state.isLoading}>
                <form onSubmit={handleSubmit}>
                  <FormGroup className="col-md-6">
                    <Field name="courseTaskId">
                      {({ input, meta }) => (
                        <>
                          <Label>Task</Label>
                          <Input
                            {...input}
                            name="tasks"
                            type="select"
                            onChange={e => {
                              input.onChange(e);
                              this.onChangeTask(e.target.value);
                            }}
                          >
                            <option value="">(Empty)</option>
                            {this.state.courseTasks.map((task, i) => (
                              <option value={task.courseTaskId} key={i}>
                                {task.name}
                              </option>
                            ))}
                          </Input>
                          <ValidationError meta={meta} />
                        </>
                      )}
                    </Field>
                  </FormGroup>
                  <FormGroup className="col-md-6">
                    <StudentSelect name="studentId" data={this.state.students} />
                  </FormGroup>
                  <FormGroup className="col-md-6">
                    <Field name="githubPrUrl" validate={taskGithubPrValidator(this.state.courseTasks)}>
                      {({ input, meta }) => (
                        <>
                          <Label>Github PR</Label>
                          <Input {...input} placeholder="https://github.com/...." name="github-pr" type="text" />
                          <ValidationError meta={meta} />{' '}
                        </>
                      )}
                    </Field>
                  </FormGroup>
                  <FormGroup className="col-md-6">
                    <Field name="score" validate={requiredValidator}>
                      {({ input, meta }) => (
                        <>
                          <Label>Score</Label>
                          <Input {...input} name="score" type="number" />
                          <ValidationError meta={meta} />{' '}
                        </>
                      )}
                    </Field>
                  </FormGroup>
                  <FormGroup className="col-md-6">
                    <TextArea field="comment" label="Comment" />
                  </FormGroup>
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

export default withCourseData(withSession(TaskScorePage, 'mentor'));

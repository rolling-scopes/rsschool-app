import * as React from 'react';
import { Field, Form, SubsetFormApi } from 'react-final-form';
// @ts-ignore
import AsyncSelect from 'react-select/async';
import { Alert, Button, FormGroup, Input, Label } from 'reactstrap';
import { Course, CourseService, StudentBasic, CourseTask } from 'services/course';
import { CommentInput, requiredValidator } from 'components/Forms';
import { Header } from 'components/Header';
import { LoadingScreen } from 'components/LoadingScreen';
import { Option, SingleValue } from 'components/UserSelect';
import { ValidationError } from 'components/ValidationError';
import withCourseData from 'components/withCourseData';
import withSession, { Session } from 'components/withSession';

import '../../index.scss';

type Props = {
  session: Session;
  course: Course;
};

type State = {
  students: StudentBasic[];
  tasks: CourseTask[];
  isLoading: boolean;
  submitted: boolean;
};

class RateTaskJuryPage extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
    students: [],
    tasks: [],
    submitted: false,
  };

  private courseService = new CourseService();

  async componentDidMount() {
    const courseId = this.props.course.id;
    const [courseStudents, courseTasks] = await Promise.all([
      this.courseService.getCourseStudents(courseId),
      this.courseService.getCourseTasks(courseId),
    ]);

    const students = courseStudents;
    const juryTasks = courseTasks.filter(task => task.useJury);

    this.setState({ students, tasks: juryTasks });
  }

  handleSubmit = async (values: any, formApi: SubsetFormApi) => {
    try {
      this.setState({ isLoading: true });

      const courseId = this.props.course.id;
      await this.courseService.postStudentScore(courseId, values.student.id, {
        courseTaskId: values.courseTaskId,
        score: values.score,
        comment: values.comment,
      });
      formApi.reset();

      this.setState({ submitted: true, isLoading: false });
    } catch (e) {
      this.setState({ submitted: false, isLoading: false });
    }
  };

  loadStudents = async (searchText: string) => {
    if (!searchText) {
      return this.state.students.slice(0, 10);
    }
    return this.state.students.filter(student => student.githubId.startsWith(searchText.toLowerCase())).slice(0, 10);
  };

  render() {
    return (
      <>
        <Header courseName={this.props.course.name} username={this.props.session.githubId} />
        <div className="m-3">
          <h3 className="mb-3">Rate Task</h3>
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
                          <Input {...input} name="tasks" type="select">
                            <option value="">(Empty)</option>
                            {this.state.tasks.map((task, i) => (
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
                    <Field name="student" validate={requiredValidator}>
                      {({ input, meta }) => (
                        <>
                          <Label>Student</Label>
                          <AsyncSelect
                            placeholder={'(Choose Student)'}
                            isSearchable={true}
                            cacheOptions={true}
                            getOptionValue={(student: StudentBasic) => student.githubId}
                            components={{ Option, SingleValue }}
                            noOptionsMessage={() => 'Start typing...'}
                            loadOptions={this.loadStudents}
                            onChange={(value: any) => input.onChange(value)}
                          />
                          <ValidationError meta={meta} />
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
                          <ValidationError meta={meta} />
                        </>
                      )}
                    </Field>
                  </FormGroup>
                  <FormGroup className="col-md-6">
                    <CommentInput />
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

export default withCourseData(withSession(RateTaskJuryPage));

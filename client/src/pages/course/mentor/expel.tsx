import * as React from 'react';
import axios from 'axios';
import { Form, SubsetFormApi } from 'react-final-form';
import { Alert, Button, FormGroup } from 'reactstrap';

import { CommentInput, StudentSelect } from 'components/Forms';
import { Header } from 'components/Header';
import { LoadingScreen } from 'components/LoadingScreen';
import withCourseData from 'components/withCourseData';
import withSession, { Session } from 'components/withSession';

import { Course, CourseService, StudentBasic } from 'services/course';
import '../../../index.scss';

type Props = {
  session: Session;
  course: Course;
};

type State = {
  students: StudentBasic[];
  submitted: boolean;
  resultMessage: string | undefined;
  isLoading: boolean;
};

class ExpelPage extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
    students: [],
    submitted: false,
    resultMessage: undefined,
  };
  formRef = React.createRef();
  courseService = new CourseService();

  async componentDidMount() {
    const courseId = this.props.course.id;
    const students = this.courseService.isPowerUser(courseId, this.props.session)
      ? await this.courseService.getCourseStudents(courseId)
      : await this.courseService.getMentorStudents(courseId);
    const activeStudents = students.filter(student => student.isActive);
    this.setState({ students: activeStudents });
  }

  handleSubmit = async (values: any, form: SubsetFormApi) => {
    this.setState({ isLoading: true });

    try {
      await axios.post(`/api/course/${this.props.course.id}/expulsion`, values);
      this.setState({
        isLoading: false,
        submitted: true,
        resultMessage: 'The student has been expelled',
      });
      form.reset();
    } catch (e) {
      this.setState({ isLoading: false, resultMessage: 'An error occurred' });
    }
  };

  render() {
    return (
      <>
        <Header username={this.props.session.githubId} courseName={this.props.course.name} />
        <div className="m-3">
          <h4 className="mb-3">
            <Alert color="danger">Expel student from {this.props.course.name}</Alert>
          </h4>

          {this.state.submitted && <Alert color="info">{this.state.resultMessage}</Alert>}

          <Form
            onSubmit={this.handleSubmit}
            render={({ handleSubmit }) => (
              <LoadingScreen show={this.state.isLoading}>
                <form onSubmit={handleSubmit}>
                  <FormGroup className="col-md-6">
                    <StudentSelect name="studentId" data={this.state.students} />
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

export default withCourseData(withSession(ExpelPage, 'mentor'));

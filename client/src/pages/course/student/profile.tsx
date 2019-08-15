import * as React from 'react';
import { Alert } from 'reactstrap';

import { Header } from 'components/Header';
import withCourseData from 'components/withCourseData';
import withSession, { Session } from 'components/withSession';

import { Course, CourseService, StudentProfile } from 'services/course';
import '../../../index.scss';

type Props = {
  course: Course;
  session: Session;
};

type State = {
  data: StudentProfile | null;
  error: boolean;
};

class StudentProfilePage extends React.Component<Props, State> {
  state: State = {
    data: null,
    error: false,
  };

  service = new CourseService();

  async componentDidMount() {
    try {
      const response = await this.service.getStudentProfile(this.props.course.id);
      this.setState({ data: response });
    } catch (e) {
      this.setState({ error: true });
    }
  }

  renderProfile() {
    if (this.state.error) {
      return <Alert color="danger">An error occured. Please try later or contact admin</Alert>;
    }
    if (!this.state.data) {
      return null;
    }
    const data = this.state.data;
    return (
      <div className="m-3">
        <div>My Score: {data.totalScore}</div>
        {data.mentor && (
          <div>
            <div>My Mentor: {data.mentor.githubId}</div>
            <div>
              Contacts: {data.mentor.email}, {data.mentor.phone}
            </div>
          </div>
        )}
      </div>
    );
  }

  render() {
    const { session, course } = this.props;
    return (
      <>
        <Header username={session.githubId} courseName={course.name} />
        {this.renderProfile()}
      </>
    );
  }
}

export default withCourseData(withSession(StudentProfilePage, 'student'));

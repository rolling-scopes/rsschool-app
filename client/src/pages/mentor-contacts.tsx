import * as React from 'react';
import { Header } from '../components/Header';
import axios from 'axios';
import { ListGroup } from 'reactstrap';
import withCourseData from 'components/withCourseData';
import withSession, { Session } from 'components/withSession';
import { Course } from 'services/course';

import '../index.scss';

type Props = {
  course: Course;
  session: Session;
};

type State = {
  profiles: any[];
};

class MentorContactsPage extends React.Component<Props, State> {
  state: State = {
    profiles: [],
  };

  async componentDidMount() {
    const response = await axios.get(`/api/course/${this.props.course.id}/mentorContacts`);
    this.setState({ profiles: response.data.data });
  }

  renderProfiles() {
    if (!this.state.profiles || this.state.profiles.length === 0) {
      return <div>No Mentors</div>;
    }
    return this.state.profiles.map(profile => (
      <div className="m-3" key={profile.githubId}>
        <div>GithubId: {profile.githubId}</div>
        <ListGroup>
          {profile.contacts
            .filter((c: string) => c)
            .map((c: string) => (
              <div key={c}>{c}</div>
            ))}
        </ListGroup>
      </div>
    ));
  }

  render() {
    return (
      <>
        <Header username="" />
        <div className="m-3">
          <h3 className="mb-3">Available Mentor Contacts</h3>
          {this.renderProfiles()}
        </div>
      </>
    );
  }
}

export default withCourseData(withSession(MentorContactsPage));

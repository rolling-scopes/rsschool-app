import * as React from 'react';
import { Table, Button, Card, CardBody, CardTitle } from 'reactstrap';
import { Header } from 'components/Header';
import axios from 'axios';
import { LoadingScreen } from '../components/LoadingScreen';
import { withRouter, RouterProps } from 'next/router';
import withSession, { Session } from '../components/withSession';

import '../index.scss';

type Props = {
  router: RouterProps;
  session: Session;
};

type State = {
  profile: ProfileResponse | null;
  isLoading: boolean;
  user: { id: number; githubId: string } | null;
};

type ResponseStudent = {
  id: number;
  totalScore: number;
  completed: boolean;
  interviews: {
    score: number;
    comment: string;
    formAnswers: {
      questionText: string;
      answer: string;
    }[];
    courseTask: {
      id: number;
      name: string;
      descriptionUrl: string;
    };
  }[];
  taskResults: {
    score: number;
    githubPrUrl: string;
    comment: string;
    courseTask: {
      id: number;
      name: string;
      descriptionUrl: string;
    };
  }[];
  mentor: {
    id: number;
    githubId: string;
    lastName: string;
    firstName: string;
  } | null;
};

type ResponseMentor = {
  id: number;
  students: {
    id: number;
    userId: number;
    githubId: string;
    lastName: string;
    firstName: string;
  }[];
};

type ResponseCourse = {
  id: number;
  name: string;
};

type ProfileResponse = {
  user: {
    id: string;
    githubId: string;
  };
  students: (ResponseStudent & { course: ResponseCourse })[];
  mentors: (ResponseMentor & { course: ResponseCourse })[];
};

type HistoryEntry = {
  course: {
    id: number;
    name: string;
  };
  mentor: any;
  student: any;
};

class ProfilePage extends React.Component<Props, State> {
  state: State = {
    isLoading: true,
    profile: null,
    user: null,
  };

  constructor(props: Readonly<Props>) {
    super(props);
    this.fetchData = this.fetchData.bind(this);
  }

  async fetchData() {
    this.setState({ isLoading: true });

    const { router } = this.props;

    try {
      const githubId = router.query ? (router.query.githubId as string) : null;
      const response = githubId
        ? await axios.get(`api/profile`, { params: { githubId } })
        : await axios.get(`api/profile/me`);

      const profile = response.data.data;
      const user = githubId ? { id: profile.id, githubId } : null;
      this.setState({ isLoading: false, profile, user });
    } catch (e) {
      this.setState({ isLoading: false, profile: null });
    }
  }

  async componentDidMount() {
    await this.fetchData();
  }

  async componentDidUpdate(prevProps: { router: { query?: any } }) {
    if (prevProps.router.query.githubId !== this.props.router.query!.githubId) {
      await this.fetchData();
    }
  }

  renderProfile() {
    if (!this.state.profile) {
      return (
        <div>
          <Header username={this.props.session.githubId} />
          <h2 className="m-4">No Access</h2>
        </div>
      );
    }
    const { profile } = this.state;

    const entries = profile.mentors
      .map<HistoryEntry>(({ course, ...mentor }) => {
        return {
          course,
          mentor,
          student: null,
        };
      })
      .concat(
        profile.students.map<HistoryEntry>(({ course, ...student }) => {
          return {
            course,
            mentor: null,
            student,
          };
        }),
      )
      .sort((a, b) => b.course.name.localeCompare(a.course.name));

    // const mentorCourses = profile.mentors.map(data => data.course.name);
    // const mentorStudents = profile.mentors
    //   .map(data =>
    //     data.students.map(s => ({
    //       githubId: s.user.githubId,
    //       name: `${s.user.firstName} ${s.user.lastName}`,
    //     })),
    //   )
    //   .reduce((acc: any, v: any) => acc.concat(v), []);

    return (
      <div>
        <Header username={this.props.session.githubId} />
        <div className="profile_container">
          {this.renderGeneralInfo(profile.user)}
          {this.renderBadges(profile)}
          {entries.map(entry => {
            return (
              <>
                {entry.student && this.renderStudentProfile(entry.course, entry.student)}
                {entry.mentor && this.renderMentorProfile(entry.course, entry.mentor)}
              </>
            );
          })}
          {/* {this.renderStudentProfile(profile)} */}

          {/* <div className="profile_header">Mentor Profile</div>
          <div className="profile_section">
            <div className="profile_label">Courses</div>
            <div className="profile_value">{mentorCourses.join(', ')}</div>
          </div>
          <div className="profile_section">
            <div className="profile_label">Students</div>
            <div className="profile_value">
              {mentorStudents.map((st: any, i: any) => (
                <span key={i}>
                  <Link href={{ pathname: '/profile', query: { githubId: st.githubId } }}>
                    <a>{st.name}</a>
                  </Link>
                  {i !== mentorStudents.length - 1 ? <span>{', '}</span> : null}
                </span>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    );
  }

  render() {
    if (!this.props.session) {
      return null;
    }
    return (
      <>
        <LoadingScreen show={this.state.isLoading}>{this.renderProfile()}</LoadingScreen>
      </>
    );
  }

  private renderGeneralInfo(profile: any) {
    const user = this.state.user;
    return (
      <>
        <div className="profile_header">General Information</div>
        <div className="profile_section">
          <div className="profile_value profile-avatar-action">
            <img width="64" height="64" src={`https://github.com/${profile.githubId}.png`} />
            <div className="spacer" />
            {!user ? (
              <Button
                onClick={() => {
                  this.props.router.push('/profile-edit');
                }}
                color="primary"
                className="profile-action-edit"
              >
                Edit
              </Button>
            ) : (
              <Button
                onClick={() => {
                  this.props.router.push(`/private-feedback?githubId=${user.githubId}&userId=${user.id}`);
                }}
                color="primary"
                className="profile-action-edit"
              >
                Leave Private Feedback
              </Button>
            )}
            <div className="ml-3" />
          </div>
        </div>
        <div className="profile_section">
          <div className="profile_label">Name and Surname</div>
          <div className="profile_value">
            {profile.firstNameNative} {profile.lastNameNative}
          </div>
        </div>
        <div className="profile_section">
          <div className="profile_label">Name and Surname as in passport</div>
          <div className="profile_value">
            {profile.firstName} {profile.lastName}
          </div>
        </div>
        <div className="profile_section">
          <div className="profile_label">Location</div>
          <div className="profile_value">{profile.locationName}</div>
        </div>
        <div className="profile_section">
          <div className="profile_label">Github</div>
          <div className="profile_value">
            <a href={`https://github.com/${profile.githubId}`}>{`https://github.com/${profile.githubId}`}</a>
          </div>
        </div>
        <div className="profile_section">
          <div className="profile_label">Contacts</div>
          <div className="profile_value">
            <a href={`tel:${profile.contactsPhone}`}>{profile.contactsPhone}</a>
            <br />
            <a href={`mailto:${profile.contactsEmail}`}>{profile.contactsEmail}</a>
            <a href={`mailto:${profile.contactsEpamEmail}`}>{profile.contactsEpamEmail}</a>
          </div>
        </div>
        <div className="profile_section">
          <div className="profile_label">Education</div>
          <div className="profile_value">
            {profile.educationHistory
              .filter((edh: any) => edh.university || edh.faculty)
              .map((edh: any, i: number) => (
                <div key={i}>
                  <div>Graduation Year: {edh.graduationYear}</div>
                  <div>University: {edh.university}</div>
                  <div>Faculty: {edh.faculty}</div>
                </div>
              ))}
          </div>
        </div>
        <div className="profile_section">
          <div className="profile_label">Employment history</div>
          <div className="profile_value">{profile.employmentHistory.join(', ')}</div>
        </div>
        <div className="profile_section">
          <div className="profile_label">Estimated english level</div>
          <div className="profile_value">{profile.englishLevel ? profile.englishLevel.toUpperCase() : null}</div>
        </div>
        <div className="profile_section">
          <div className="profile_label">CV</div>
          <div className="profile_value">
            <a href={`${profile.cvUrl}`}>{profile.cvUrl}</a>
          </div>
        </div>
        <div className="profile_section">
          <div className="profile_label">External accounts</div>
          <div className="profile_value">
            {profile.externalAccounts
              .filter((exta: any) => exta.username)
              .map((exta: any) => `Service: ${exta.service} Name: ${exta.username}`)}
          </div>
        </div>
        <div className="profile_section">
          <div className="profile_label">Fulltime ready</div>
          <div className="profile_value">{profile.readyFullTime}</div>
        </div>
      </>
    );
  }

  private renderStudentMentor(student: ResponseStudent) {
    return (
      <div>
        Mentor:{' '}
        {student.mentor ? (
          <a href={this.getLink(student.mentor.githubId)}>
            {student.mentor.firstName} {student.mentor.lastName}
          </a>
        ) : (
          'No Mentor'
        )}
      </div>
    );
  }

  private renderMentorProfile(course: ResponseCourse, mentor: ResponseMentor) {
    return (
      <Card className="mt-3">
        <CardBody>
          <CardTitle tag="h4" className="profile-course-name">
            {course.name} (Mentor)
          </CardTitle>

          {mentor.students.length > 0 && (
            <Table className="profile-task-table mt-3">
              <thead>
                <tr>
                  <th>Student GithubId</th>
                  <th>Score</th>
                  <th>Completed</th>
                </tr>
              </thead>
              <tbody>
                {mentor.students.map((t: any, i: any) => {
                  return (
                    <tr key={i}>
                      <th className="w-25">
                        <a href={this.getLink(t.githubId)}>{t.githubId}</a>
                      </th>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    );
  }

  private renderStudentProfile(course: ResponseCourse, student: ResponseStudent) {
    const tasks = student.taskResults;
    const hasTasks = tasks.length > 0;
    const hasInterviews = student.interviews.length > 0;
    return (
      <Card className="mt-3">
        <CardBody>
          <CardTitle tag="h4" className="profile-course-name">
            {course.name} (Student)
          </CardTitle>
          <div>Score: {student.totalScore}</div>
          <div>Completed: {student.completed ? 'Yes' : 'No'}</div>
          {this.renderStudentMentor(student)}
          {hasTasks && (
            <div className="mt-3">
              <h5>Tasks</h5>
              <Table className="profile-task-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Score</th>
                    <th>Comment</th>
                    <th>PR</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t: any, i: any) => {
                    return (
                      <tr key={i}>
                        <th className="w-25">
                          {t.courseTask.descriptionUrl ? (
                            <a href={t.courseTask.descriptionUrl}>{t.courseTask.name}</a>
                          ) : (
                            t.courseTask.name
                          )}
                        </th>
                        <td>{t.score}</td>
                        <td>{t.comment || ''}</td>
                        <td>{t.githubPrUrl ? <a href={t.githubPrUrl}>{t.githubPrUrl}</a> : t.githubPrUrl}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
          {hasInterviews && (
            <div className="mt-5">
              <h5>{student.interviews[0].courseTask.name}</h5>
              <Table className="profile-interview-table">
                <tr>
                  <td>Score</td>
                  <td>{student.interviews[0].score}</td>
                </tr>
                <tr>
                  <td>Comment</td>
                  <td>{student.interviews[0].comment}</td>
                </tr>
                {student.interviews[0].formAnswers.map((answer, i) => (
                  <tr key={i}>
                    <td>{answer.questionText}</td>
                    <td>{answer.answer}</td>
                  </tr>
                ))}
              </Table>
            </div>
          )}
        </CardBody>
      </Card>
    );
  }

  private getLink(githubId: string) {
    return `/profile?githubId=${githubId}`;
  }

  private renderBadges(profile: any) {
    const receivedFeedback: {
      fromUser: number;
      toUser: number;
      comment: string;
      badgeId: string;
    }[] = profile.receivedFeedback;

    if (receivedFeedback.length === 0) {
      return (
        <>
          <h5 className="mt-3">#gratitude</h5>
          <div>No Data</div>
        </>
      );
    }
    return (
      <>
        <h5 className="mt-3">#gratitude</h5>
        {receivedFeedback.map((feedback, i) => (
          <div key={i}>
            <div className="profile_section">
              <div className="profile_label">Comment</div>
              <div className="profile_value">
                {feedback.comment} ({feedback.badgeId})
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }
}

export default withRouter(withSession(ProfilePage));

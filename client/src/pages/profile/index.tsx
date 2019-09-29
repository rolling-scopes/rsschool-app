import {
  Button,
  Descriptions,
  Table,
  Statistic,
  Col,
  List,
  Typography,
  Divider,
  Row,
  Card,
  Tag,
  Icon,
  Result,
} from 'antd';
import { Header } from 'components/Header';
import { NextRouter, withRouter } from 'next/router';
import * as React from 'react';
import { LoadingScreen } from 'components/LoadingScreen';
import withSession, { Session } from 'components/withSession';
import { GithubAvatar } from 'components/GithubAvatar';
import { UserService, UserFull, ProfileResponse, ResponseCourse, ResponseMentor, ResponseStudent } from 'services/user';
import { formatDate } from 'services/formatter';

type Props = {
  router: NextRouter;
  session: Session;
};

type State = {
  profile: ProfileResponse | null;
  isLoading: boolean;
  user: { id: number; githubId: string } | null;
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

  private userService = new UserService();

  private fetchData = async () => {
    this.setState({ isLoading: true });

    const { router } = this.props;

    try {
      const githubId = router.query ? (router.query.githubId as string) : null;
      const profile = githubId ? await this.userService.getProfile(githubId) : await this.userService.getProfile();

      const user = githubId ? { id: profile.user.id, githubId } : null;
      this.setState({ isLoading: false, profile, user });
    } catch (e) {
      this.setState({ isLoading: false, profile: null });
    }
  };

  async componentDidMount() {
    await this.fetchData();
  }

  async componentDidUpdate(prevProps: { router: { query?: any } }) {
    if (prevProps.router.query.githubId !== this.props.router.query!.githubId) {
      await this.fetchData();
    }
  }

  render() {
    return (
      <>
        <LoadingScreen show={this.state.isLoading}>{this.renderProfile()}</LoadingScreen>
      </>
    );
  }

  private renderProfile() {
    if (!this.state.profile) {
      return (
        <>
          <Header username={this.props.session.githubId} />
          <Result status="403" title="No access or user does not exist" />
        </>
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

    const statsTitle = (
      <h2>
        <Icon type="profile" /> Statistics
      </h2>
    );
    const coursesAsMentor = entries.filter(e => e.mentor && e.mentor.students.length);
    const mentoredStudentsCount = coursesAsMentor.reduce((acc, e) => acc + e.mentor.students.length, 0);
    return (
      <>
        <Header username={this.props.session.githubId} />
        <div className="m-3">
          {this.renderGeneralInfo(profile.user)}
          <Divider dashed />
          {this.renderPublicFeedback(profile)}
          <Divider dashed />
          <Card bordered={false} size="small" title={statsTitle}>
            <Row gutter={48}>
              <Col span={12}>
                <Statistic title="Mentored Students" value={mentoredStudentsCount} />
              </Col>
              <Col span={12}>
                <Statistic title="Courses as Mentor" value={coursesAsMentor.length} />
              </Col>
            </Row>
          </Card>
          <Divider dashed />
          {entries.map((entry, i) => (
            <div className="mb-3" key={i}>
              {entry.student && this.renderStudentProfile(entry.course, entry.student)}
              {entry.mentor && this.renderMentorProfile(entry.course, entry.mentor)}
            </div>
          ))}
        </div>
      </>
    );
  }

  private renderGeneralInfo(profile: UserFull) {
    const user = this.state.user;
    const education = profile.educationHistory
      .filter((edh: any) => edh.university || edh.faculty)
      .map((edh: any, i: number) => (
        <div key={i}>
          <div>Graduation Year: {edh.graduationYear}</div>
          <div>University: {edh.university}</div>
          <div>Faculty: {edh.faculty}</div>
        </div>
      ));
    const externalAccounts = profile.externalAccounts
      .filter((exta: any) => exta.username)
      .map((exta: any, i: number) => (
        <div key={i}>
          {exta.service}: {exta.username}
        </div>
      ));
    const employmentHistory = profile.employmentHistory
      .filter((eh: any) => eh.companyName)
      .map((eh: any, i: number) => {
        return (
          <div key={i}>
            <div>Company Name: {eh.companyName}</div>
            <div>Title: {eh.title}</div>
            <div>
              Period: {eh.dateFrom} - {eh.dateTo}
            </div>
          </div>
        );
      });
    const emptyValue = '(Empty)';
    return (
      <>
        <Row type="flex" justify="space-between">
          <GithubAvatar size={96} githubId={profile.githubId} />
          {!user ? (
            <Button type="primary" onClick={() => this.props.router.push('/profile/edit')} color="primary">
              Edit Profile
            </Button>
          ) : (
            <Button
              onClick={() => this.props.router.push(`/private-feedback?githubId=${user.githubId}&userId=${user.id}`)}
            >
              Leave Private Feedback
            </Button>
          )}
        </Row>
        <Descriptions
          size="small"
          bordered
          column={1}
          title={
            <span>
              <Icon type="idcard" /> General Info
            </span>
          }
        >
          <Descriptions.Item label="Name">
            {profile.firstName} {profile.lastName}
          </Descriptions.Item>
          <Descriptions.Item label="Primary Email">{profile.primaryEmail}</Descriptions.Item>
          <Descriptions.Item label="Location">{profile.locationName}</Descriptions.Item>
          <Descriptions.Item label="Estimated english level">
            {profile.englishLevel ? profile.englishLevel.toUpperCase() : null}
          </Descriptions.Item>
          <Descriptions.Item label="Github">
            <a href={`https://github.com/${profile.githubId}`}>{`https://github.com/${profile.githubId}`}</a>
          </Descriptions.Item>

          <Descriptions.Item label="External Accounts">
            {externalAccounts.length ? externalAccounts : emptyValue}
          </Descriptions.Item>
          <Descriptions.Item label="Education">{education.length ? education : emptyValue}</Descriptions.Item>
          <Descriptions.Item label="Employment history">
            {employmentHistory.length ? employmentHistory : emptyValue}
          </Descriptions.Item>
        </Descriptions>
        <Descriptions className="mt-3" size="small" title="Contacts" bordered column={1}>
          <Descriptions.Item label="Email">{profile.contactsEmail}</Descriptions.Item>
          <Descriptions.Item label="Phone">{profile.contactsPhone}</Descriptions.Item>
          <Descriptions.Item label="Skype">{profile.contactsSkype}</Descriptions.Item>
          <Descriptions.Item label="Telegram">{profile.contactsTelegram}</Descriptions.Item>
          <Descriptions.Item label="EPAM Email">{profile.contactsEpamEmail}</Descriptions.Item>
        </Descriptions>
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
    const title = (
      <h2>
        <Icon type="team" /> {course.name} (Mentor)
      </h2>
    );
    return (
      <Card bordered={false} size="small" title={title}>
        {mentor.students.length > 0 && (
          <List
            size="small"
            header={'Students'}
            dataSource={mentor.students}
            renderItem={({ githubId }) => <List.Item>{this.renderGithubLink(githubId)}</List.Item>}
          />
        )}
      </Card>
    );
  }

  private renderStudentProfile(course: ResponseCourse, student: ResponseStudent) {
    const tasks = student.taskResults.map(t => ({ ...t, id: t.courseTask.id }));
    const hasTasks = tasks.length > 0;
    const hasInterviews = student.interviews.length > 0;
    const title = (
      <h2>
        <Icon type="user" /> {course.name} (Student)
      </h2>
    );
    return (
      <Card bordered={false} size="small" title={title}>
        {student.certificatePublicId && (
          <div>
            <Icon style={{ fontSize: '16px' }} type="safety-certificate" twoToneColor="#52c41a" theme="twoTone" />{' '}
            <a href={`/certificate/${student.certificatePublicId}`}>Certificate</a>
          </div>
        )}
        <div>
          Score: <Typography.Text mark>{student.totalScore}</Typography.Text>
        </div>
        {this.renderStudentMentor(student)}
        {hasTasks && (
          <div className="mt-2">
            <h4>Tasks</h4>
            <Table
              pagination={{ pageSize: 30 }}
              dataSource={tasks}
              size="small"
              rowKey="id"
              columns={[
                {
                  title: 'Name',
                  dataIndex: 'courseTask.name',
                },
                {
                  title: 'Score',
                  dataIndex: 'score',
                },
                {
                  title: 'Comment',
                  dataIndex: 'comment',
                },
                {
                  title: 'Github PR Url',
                  dataIndex: 'githubPrUrl',
                  render: (value: string) => (value ? <a href={value}>{value}</a> : value),
                },
              ]}
            />
          </div>
        )}
        {hasInterviews && (
          <div>
            <h4>{student.interviews[0].courseTask.name}</h4>
            <Descriptions size="small" column={1} bordered>
              <Descriptions.Item label="Score">
                <Typography.Text mark>&nbsp;{student.interviews[0].score}&nbsp;</Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Comment">{student.interviews[0].comment}</Descriptions.Item>
              {student.interviews[0].formAnswers.map((answer, i) => (
                <Descriptions.Item label={answer.questionText} key={i}>
                  {answer.answer === 'true' ? (
                    <Tag color="green">Yes</Tag>
                  ) : answer.answer === 'false' ? (
                    <Tag color="red">No</Tag>
                  ) : (
                    answer.answer
                  )}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </div>
        )}
      </Card>
    );
  }

  private getLink(githubId: string) {
    return `/profile?githubId=${githubId}`;
  }

  private renderPublicFeedback(profile: any) {
    const receivedFeedback: {
      fromUser: UserFull;
      comment: string;
      badgeId: string;
      createdDate: string;
    }[] = profile.receivedFeedback;

    const dataSource = receivedFeedback.map((f, i) => (
      <div key={i}>
        <h4>
          {formatDate(f.createdDate)} from {this.renderGithubLink(f.fromUser.githubId)}:
        </h4>
        {f.comment}
      </div>
    ));
    if (dataSource.length === 0) {
      dataSource.push(<span>No Data</span>);
    }
    const title = (
      <h2>
        <Icon type="smile" /> Public Feedback (#gratitude)
      </h2>
    );
    return (
      <Card size="small" bordered={false} title={title}>
        <List
          size="small"
          bordered={false}
          dataSource={dataSource}
          renderItem={item => <List.Item>{item}</List.Item>}
        />
      </Card>
    );
  }

  private renderGithubLink(githubId: string) {
    return <a href={this.getLink(githubId)}>{githubId}</a>;
  }
}

export default withRouter(withSession(ProfilePage));

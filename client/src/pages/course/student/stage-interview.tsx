import { Table, Typography } from 'antd';
import { GithubUserLink, Header, LoadingScreen, withSession } from 'components';
import withCourseData from 'components/withCourseData';
import * as React from 'react';
import { CourseService } from 'services/course';
import { CoursePageProps } from 'services/models';

type State = {
  records: any[];
  isLoading: boolean;
};

class ScorePage extends React.Component<CoursePageProps, State> {
  state: State = {
    isLoading: false,
    records: [],
  };

  private courseService = new CourseService();

  async componentDidMount() {
    await this.loadInterviews();
  }

  render() {
    const hasRecords = this.state.records.length;
    return (
      <>
        <Header title="Stage Interviews" username={this.props.session.githubId} courseName={this.props.course.name} />
        <LoadingScreen show={this.state.isLoading}>
          {hasRecords ? (
            <Typography.Text type="danger" className="m-3">
              You need to contact your interviewer and agree about interview until 27th October (Sunday)
            </Typography.Text>
          ) : null}
          <Table
            bordered
            className="m-3"
            pagination={false}
            size="small"
            dataSource={this.state.records}
            columns={[
              {
                title: 'Interviewer',
                dataIndex: 'mentor.githubId',
                width: 120,
                render: (value: string) => <GithubUserLink value={value} />,
              },
              {
                title: 'Contacts Notes',
                dataIndex: 'mentor.contactsNotes',
              },
              {
                title: 'Telegram',
                dataIndex: 'mentor.contactsTelegram',
              },
              {
                title: 'Skype',
                dataIndex: 'mentor.contactsSkype',
              },
              {
                title: 'Phone',
                dataIndex: 'mentor.contactsPhone',
              },
              {
                title: 'Email',
                dataIndex: 'mentor.contactsEmail',
              },
            ]}
          />
        </LoadingScreen>
      </>
    );
  }

  private async loadInterviews() {
    this.setState({ isLoading: true });

    const courseId = this.props.course.id;
    const records = await this.courseService.getStageInterviewsByStudent(courseId, this.props.session.githubId);

    this.setState({ records, isLoading: false });
  }
}

export default withCourseData(withSession(ScorePage));

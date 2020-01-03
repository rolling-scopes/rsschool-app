import { Table, Tabs, message } from 'antd';
import { Header, LoadingScreen, withSession, GithubUserLink, Rating } from 'components';
import { getColumnSearchProps, stringSorter, numberSorter, boolIconRenderer } from 'components/Table';
import withCourseData from 'components/withCourseData';
import * as React from 'react';
import { CourseService } from 'services/course';
import { CoursePageProps } from 'services/models';

type State = {
  records: any[];
  availableStudents: any[];
  isLoading: boolean;
  activeKey: any;
};

class ScorePage extends React.Component<CoursePageProps, State> {
  state: State = {
    isLoading: false,
    availableStudents: [],
    records: [],
    activeKey: '1',
  };

  private courseService: CourseService;

  constructor(props: CoursePageProps) {
    super(props);
    this.courseService = new CourseService(props.course.id);
  }

  async componentDidMount() {
    await this.loadInterviews();
  }

  inviteStudent = async (student: { githubId: string }) => {
    try {
      await this.courseService.createInterview(17, [student]);
      await this.loadInterviews();
    } catch (e) {
      message.error('An error occurred.');
    }
  };

  deleteInterview = async (record: any) => {
    try {
      await this.courseService.deleteInterview(17, record.id);
      await this.loadInterviews();
    } catch (e) {
      message.error('An error occurred.');
    }
  };

  onChange = activeKey => this.setState({ activeKey });

  render() {
    return (
      <>
        <Header title="Stage Interviews" username={this.props.session.githubId} courseName={this.props.course.name} />
        <LoadingScreen show={this.state.isLoading}>
          <Tabs activeKey={this.state.activeKey} onChange={this.onChange} type="card">
            <Tabs.TabPane tab="Interviews" key="1">
              <Table
                bordered
                className="m-3"
                pagination={{ pageSize: 50 }}
                size="small"
                dataSource={this.state.records}
                columns={[
                  {
                    title: 'Mentor Profile',
                    dataIndex: 'mentor.githubId',
                    sorter: stringSorter('mentor.githubId'),
                    render: (value: string) => <GithubUserLink value={value} />,
                    ...getColumnSearchProps('mentor.githubId'),
                  },
                  {
                    title: 'Student Profile',
                    dataIndex: 'student.githubId',
                    sorter: stringSorter('student.githubId'),
                    render: (value: string) => <GithubUserLink value={value} />,
                    ...getColumnSearchProps('student.githubId'),
                  },
                  {
                    title: 'Student Location',
                    dataIndex: 'student.locationName',
                    sorter: stringSorter('student.locationName'),
                    ...getColumnSearchProps('student.locationName'),
                  },
                  {
                    title: 'Student Score',
                    dataIndex: 'student.totalScore',
                    width: 100,
                    sorter: numberSorter('student.totalScore'),
                  },
                  {
                    title: 'Is Student Active',
                    dataIndex: 'student.isActive',
                    sorter: stringSorter('student.isActive'),
                    render: boolIconRenderer,
                    width: 100,
                  },
                  {
                    title: 'Interview Completed',
                    dataIndex: 'isCompleted',
                    sorter: stringSorter('isCompleted'),
                    render: boolIconRenderer,
                    width: 100,
                  },
                  {
                    title: 'Actions',
                    dataIndex: 'actions',
                    render: (_, record) => {
                      if (record.mentor.githubId === this.props.session.githubId || this.props.session.isAdmin) {
                        return <a onClick={() => this.deleteInterview(record)}>Cancel</a>;
                      }
                      return null;
                    },
                  },
                ]}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Available Students" key="2">
              <Table
                bordered
                className="m-3"
                pagination={{ pageSize: 100 }}
                size="small"
                dataSource={this.state.availableStudents}
                columns={[
                  {
                    title: 'Github',
                    dataIndex: 'githubId',
                    sorter: stringSorter('githubId'),
                    width: 180,
                    render: (value: string) => <GithubUserLink value={value} />,
                    ...getColumnSearchProps('githubId'),
                  },
                  {
                    title: 'Feedback',
                    dataIndex: 'rating',
                    sorter: numberSorter('rating'),
                    width: 210,
                    render: (rating: number) => rating !== null && <Rating rating={rating} />,
                  },
                  {
                    title: 'Name',
                    dataIndex: 'name',
                    width: 180,
                    ...getColumnSearchProps('name'),
                  },
                  {
                    title: 'Location',
                    dataIndex: 'locationName',
                    sorter: stringSorter('locationName'),
                    width: 180,
                    ...getColumnSearchProps('locationName'),
                  },
                  {
                    title: 'Score',
                    dataIndex: 'totalScore',
                    sorter: numberSorter('totalScore'),
                  },
                  {
                    title: 'Actions',
                    dataIndex: 'actions',
                    render: (_, record) => <a onClick={() => this.inviteStudent(record)}>Want to interview</a>,
                  },
                ]}
              />
            </Tabs.TabPane>
          </Tabs>
        </LoadingScreen>
      </>
    );
  }

  private async loadInterviews() {
    this.setState({ isLoading: true });

    const [records, availableStudents] = await Promise.all([
      this.courseService.getStageInterviews(17),
      this.courseService.getAvailableStudentsForStageInterviews(17),
    ]);

    this.setState({ records, availableStudents, isLoading: false });
  }
}

export default withCourseData(withSession(ScorePage));

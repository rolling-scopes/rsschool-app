import { Table } from 'antd';
import { GithubAvatar, Header, LoadingScreen, withSession } from 'components';
import { getColumnSearchProps, stringSorter } from 'components/Table';
import withCourseData from 'components/withCourseData';
import _ from 'lodash';
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
    return (
      <>
        <Header title="Stage Interviews" username={this.props.session.githubId} courseName={this.props.course.name} />
        <LoadingScreen show={this.state.isLoading}>
          <ul className="m-3">
            Reserved mentors:
            {['qwelias', 'agavrilin', 'tuwhoo', 'vinfinit', 'prodislav'].map(githubId => (
              <div key={githubId} className="d-flex flex-row">
                <GithubAvatar githubId={githubId} size={24} />
                &nbsp;<a href={`/profile?githubId=${githubId}`}>{githubId}</a>
              </div>
            ))}
          </ul>
          <Table
            bordered
            className="m-3"
            pagination={{ pageSize: 50 }}
            size="small"
            dataSource={this.state.records}
            columns={[
              {
                title: 'Mentor Github Id',
                dataIndex: 'mentor.githubId',
                sorter: stringSorter('mentor.githubId'),
                width: 180,
                render: (value: string) => (
                  <div className="d-flex flex-row">
                    <GithubAvatar githubId={value} size={24} />
                    &nbsp;<a href={`/profile?githubId=${value}`}>{value}</a>
                  </div>
                ),
                ...getColumnSearchProps('mentor.githubId'),
              },
              {
                title: 'Student Github Id',
                dataIndex: 'student.githubId',
                sorter: stringSorter('student.githubId'),
                width: 180,
                render: (value: string) => (
                  <div className="d-flex flex-row">
                    <GithubAvatar githubId={value} size={24} />
                    &nbsp;<a href={`/profile?githubId=${value}`}>{value}</a>
                  </div>
                ),
                ...getColumnSearchProps('student.githubId'),
              },
              {
                title: 'Student Location',
                dataIndex: 'student.locationName',
                sorter: stringSorter('student.locationName'),
                width: 180,
                ...getColumnSearchProps('student.locationName'),
              },
              {
                title: 'Student Score',
                dataIndex: 'student.totalScore',
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
    const records = await this.courseService.getStageInterviews(courseId, 17);

    this.setState({ records, isLoading: false });
  }
}

export default withCourseData(withSession(ScorePage));

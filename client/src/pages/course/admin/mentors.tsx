import { Divider, Statistic, Table } from 'antd';
import { GithubAvatar, Header, LoadingScreen, withSession } from 'components';
import { getColumnSearchProps, stringSorter, numberSorter } from 'components/Table';
import withCourseData from 'components/withCourseData';
import _ from 'lodash';
import * as React from 'react';
import { CourseService, MentorDetails } from 'services/course';
import { CoursePageProps } from 'services/models';

type State = {
  records: MentorDetails[];
  isLoading: boolean;
  stats: {
    recordCount: number;
    countries: { name: string; totalCount: number }[];
  };
};

class ScorePage extends React.Component<CoursePageProps, State> {
  state: State = {
    isLoading: false,
    records: [],
    stats: {
      recordCount: 0,
      countries: [],
    },
  };

  private courseService = new CourseService();

  async componentDidMount() {
    this.setState({ isLoading: true });

    const courseId = this.props.course.id;
    const records: any[] = await this.courseService.getCourseMentors(courseId);
    const countries: Record<string, { totalCount: number }> = {};

    for (const record of records) {
      const { countryName } = record;
      if (!countries[countryName]) {
        countries[countryName] = { totalCount: 0 };
      }
      countries[countryName].totalCount++;
      const { interviewsCount, maxStudentsLimit } = record as MentorDetails;
      record.capacity = maxStudentsLimit + 2 - interviewsCount;
    }

    this.setState({
      records,
      isLoading: false,
      stats: {
        recordCount: records.length,
        countries: _.keys(countries).map(k => ({
          name: k,
          totalCount: countries[k].totalCount,
        })),
      },
    });
  }

  render() {
    return (
      <>
        <Header title="Course Mentors" username={this.props.session.githubId} courseName={this.props.course.name} />
        <LoadingScreen show={this.state.isLoading}>
          <Statistic className="m-3" title="Total Count" value={this.state.stats.recordCount} />
          <Table
            className="m-3"
            pagination={false}
            size="small"
            rowKey="name"
            dataSource={this.state.stats.countries}
            columns={[{ title: 'Country', dataIndex: 'name' }, { title: 'Count', dataIndex: 'totalCount' }]}
          />
          <Divider dashed />
          <Table<MentorDetails>
            bordered
            className="m-3"
            pagination={{ pageSize: 100 }}
            size="small"
            rowKey="githubId"
            dataSource={this.state.records}
            columns={[
              {
                title: 'Github',
                dataIndex: 'githubId',
                sorter: stringSorter('githubId'),
                width: 120,
                key: 'githubId',
                render: (value: string) => (
                  <div className="d-flex flex-row">
                    <GithubAvatar githubId={value} size={24} />
                    &nbsp;<a href={`/profile?githubId=${value}`}>{value}</a>
                  </div>
                ),
                ...getColumnSearchProps('githubId'),
              },
              {
                title: 'Name',
                dataIndex: 'lastName',
                key: 'lastName',
                width: 150,
                sorter: stringSorter('firstName'),
                render: (_: any, record: MentorDetails) => `${record.firstName} ${record.lastName}`,
                ...getColumnSearchProps('lastName'),
              },
              {
                title: 'Location',
                dataIndex: 'locationName',
                key: 'locationName',
                width: 100,
                sorter: stringSorter('locationName'),
                ...getColumnSearchProps('locationName'),
              },
              {
                title: 'Country',
                dataIndex: 'countryName',
                key: 'countryName',
                width: 100,
                sorter: stringSorter('countryName'),
                ...getColumnSearchProps('countryName'),
              },
              {
                title: 'Max Student',
                dataIndex: 'maxStudentsLimit',
                width: 100,
              },
              {
                title: 'Interview Capacity',
                dataIndex: 'capacity',
                sorter: numberSorter('capacity' as any),
                width: 100,
              },
            ]}
          />
        </LoadingScreen>
      </>
    );
  }
}

export default withCourseData(withSession(ScorePage));

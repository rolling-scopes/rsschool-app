import { Divider, Statistic, Table, Button, Spin, message } from 'antd';
import { GithubUserLink, Header, withSession } from 'components';
import StudentsAddModal from 'components/StudentsAddModal';
import { getColumnSearchProps, stringSorter, numberSorter } from 'components/Table';
import withCourseData from 'components/withCourseData';
import _ from 'lodash';
import * as React from 'react';
import { CourseService, MentorDetails } from 'services/course';
import { CoursePageProps } from 'services/models';
import { relativeDays } from 'services/formatter';

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

  private courseService: CourseService;

  constructor(props: CoursePageProps) {
    super(props);
    this.courseService = new CourseService(props.course.id);
  }

  async componentDidMount() {
    this.setState({ isLoading: true });

    const records: any[] = await this.courseService.getMentorsWithDetails();
    const countries: Record<string, { totalCount: number }> = {};

    for (const record of records) {
      const { countryName } = record;
      if (!countries[countryName]) {
        countries[countryName] = { totalCount: 0 };
      }
      countries[countryName].totalCount++;
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
    const courseId = this.props.course.id;

    return (
      <>
        <Header title="Course Mentors" username={this.props.session.githubId} courseName={this.props.course.name} />
        <Spin spinning={this.state.isLoading}>
          <Statistic className="m-3" title="Total Count" value={this.state.stats.recordCount} />
          <Table
            className="m-3"
            pagination={false}
            size="small"
            rowKey="name"
            dataSource={this.state.stats.countries}
            columns={[
              { title: 'Country', dataIndex: 'name' },
              { title: 'Count', dataIndex: 'totalCount' },
            ]}
          />
          <Divider dashed />
          <Table<MentorDetails>
            bordered
            className="m-3"
            rowKey="githubId"
            rowClassName={record => (!record.isActive ? 'rs-table-row-disabled' : '')}
            pagination={{ pageSize: 100 }}
            size="small"
            dataSource={this.state.records}
            columns={[
              {
                title: 'Github',
                dataIndex: 'githubId',
                sorter: stringSorter('githubId'),
                width: 100,
                render: (value: string) => <GithubUserLink value={value} />,
                ...getColumnSearchProps('githubId'),
              },
              {
                title: 'Name',
                dataIndex: 'name',
                width: 120,
                sorter: stringSorter('name'),
                ...getColumnSearchProps('name'),
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
                sorter: numberSorter('maxStudentsLimit'),
                width: 80,
              },
              {
                title: 'Interviews Count',
                dataIndex: 'interviewsCount',
                sorter: numberSorter('interviewsCount'),
                width: 80,
              },
              {
                title: 'Students Count',
                dataIndex: 'studentsCount',
                sorter: numberSorter('studentsCount' as any),
                width: 80,
              },
              {
                title: 'Checked Tasks',
                dataIndex: 'taskResultsStats',
                sorter: numberSorter('taskResultsStats.checked' as any),
                render: (value: any) => `${value.checked} / ${value.total}`,
              },
              {
                title: 'Last Checked Task',
                dataIndex: 'taskResultsStats.lastUpdatedDate',
                sorter: numberSorter('taskResultsStats.lastUpdatedDate' as any),
                render: (value: string) => (value ? `${relativeDays(value)} days ago` : null),
              },
              {
                title: 'Students',
                dataIndex: 'students',
                width: 80,
                render: (_: string, mentor: MentorDetails) => (
                  <>
                    <StudentsAddModal courseId={courseId} mentorsGithub={mentor.githubId} mentorId={mentor.id} />
                  </>
                ),
              },
              {
                title: 'Actions',
                dataIndex: 'actions',
                render: (_: string, mentor: MentorDetails) => (
                  <>
                    <Button type="link" onClick={() => this.handleExpell(mentor)}>
                      Expel
                    </Button>
                  </>
                ),
              },
            ]}
          />
        </Spin>
      </>
    );
  }

  private async handleExpell({ githubId }: MentorDetails) {
    try {
      this.setState({ isLoading: true });
      await this.courseService.expelMentor(githubId);
      const records = this.state.records.map(r => (r.githubId === githubId ? { ...r, isActive: false } : r));
      this.setState({ isLoading: false, records });
    } catch (e) {
      message.error('An error occured. Please try later.');
      this.setState({ isLoading: false });
    }
  }
}

export default withCourseData(withSession(ScorePage));

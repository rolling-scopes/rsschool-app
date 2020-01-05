import * as React from 'react';
import _ from 'lodash';
import { Table, Typography, Statistic, Divider, Button, Select, message, Row, Modal, Form, Spin, Col } from 'antd';
import { Header, withSession, GithubUserLink, StudentExpelModal } from 'components';
import withCourseData from 'components/withCourseData';
import { getColumnSearchProps, stringSorter, numberSorter, boolIconRenderer } from 'components/Table';
import { CourseService, StudentDetails } from 'services/course';
import { CoursePageProps } from 'services/models';
import { FormComponentProps } from 'antd/lib/form';

import css from 'styled-jsx/css';

const { Text } = Typography;

type Props = CoursePageProps & FormComponentProps;

type State = {
  students: StudentDetails[];
  isLoading: boolean;
  expelledStudent: StudentDetails | null;
  stats: {
    studentCount: number;
    activeStudentCount: number;
    countries: { name: string; count: number; totalCount: number }[];
  };
  crossCheckTasks: { id: number; name: string }[];
  crossCheckModal: 'distribution' | 'completion' | null;
};

class ScorePage extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
    students: [],
    expelledStudent: null,
    crossCheckModal: null,
    crossCheckTasks: [],
    stats: {
      studentCount: 0,
      activeStudentCount: 0,
      countries: [],
    },
  };

  private courseService: CourseService;

  constructor(props: Props) {
    super(props);
    this.courseService = new CourseService(props.course.id);
  }

  async componentDidMount() {
    this.setState({ isLoading: true });
    await this.loadStudents();
    const tasks = await this.courseService.getCourseTasks();
    const crossCheckTasks = tasks.filter(t => t.checker === 'crossCheck');
    this.setState({ crossCheckTasks, isLoading: false });
  }

  render() {
    const { expelledStudent } = this.state;
    const { getFieldDecorator: field } = this.props.form;

    return (
      <>
        <Header title="Course Students" username={this.props.session.githubId} courseName={this.props.course.name} />
        <Spin spinning={this.state.isLoading}>
          <Statistic
            className="m-3"
            title="Active Students"
            value={this.state.stats.activeStudentCount}
            suffix={`/ ${this.state.stats.studentCount}`}
          />

          <Table
            className="m-3"
            pagination={false}
            size="small"
            rowKey="name"
            dataSource={this.state.stats.countries}
            columns={[
              { title: 'Country', dataIndex: 'name' },
              { title: 'Active Students', dataIndex: 'count' },
              { title: 'Total Students', dataIndex: 'totalCount' },
            ]}
          />
          <Divider dashed />
          <StudentExpelModal
            onCancel={() => this.setState({ expelledStudent: null })}
            onOk={() => {
              const { expelledStudent } = this.state;
              const students = this.state.students.map(s =>
                expelledStudent && s.id === expelledStudent.id ? { ...s, isActive: false } : s,
              );
              this.setState({ students, expelledStudent: null });
            }}
            githubId={expelledStudent?.githubId}
            visible={!!expelledStudent}
            courseId={this.props.course.id}
          />
          <Modal
            title="Choose Task"
            visible={!!this.state.crossCheckModal}
            okText="Submit"
            okButtonProps={{ type: 'danger' }}
            onOk={this.handleCrossCheckSubmit}
            onCancel={this.handleCrossCheckCancel}
          >
            <Form layout="vertical">
              <Spin spinning={this.state.isLoading}>
                <Row gutter={24}>
                  <Col span={24}>
                    <Form.Item label="Task">
                      {field('courseTaskId', {
                        rules: [{ required: true, message: 'Please select a task' }],
                      })(
                        <Select>
                          {this.state.crossCheckTasks.map(task => (
                            <Select.Option key={task.id} value={task.id}>
                              {task.name}
                            </Select.Option>
                          ))}
                        </Select>,
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Spin>
            </Form>
          </Modal>
          <Row type="flex" justify="end" className="m-3">
            {this.props.session.isAdmin && (
              <>
                <Button style={{ marginLeft: 8 }} onClick={this.handleCreateRepos}>
                  Create Repos
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleCrossCheckDistribution}>
                  Cross-Check Distribution
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleCrossCheckCompletion}>
                  Cross-Check Completion
                </Button>
              </>
            )}
          </Row>
          <Table<StudentDetails>
            bordered
            className="m-3"
            pagination={{ pageSize: 100 }}
            size="small"
            rowKey="githubId"
            rowClassName={record => (!record.isActive ? 'rs-table-row-disabled' : '')}
            dataSource={this.state.students}
            columns={[
              {
                title: 'Github',
                dataIndex: 'githubId',
                sorter: stringSorter('githubId'),
                width: 120,
                key: 'githubId',
                render: (value: string) => <GithubUserLink value={value} />,
                ...getColumnSearchProps('githubId'),
              },
              {
                title: 'Name',
                dataIndex: 'name',
                width: 200,
                sorter: stringSorter('name'),
                ...getColumnSearchProps('name'),
              },
              {
                title: 'Mentor',
                dataIndex: 'mentor.githubId',
                key: 'mentor.githubId',
                width: 100,
                render: (value: string) => (value ? <GithubUserLink value={value} /> : null),
                ...getColumnSearchProps('mentor.githubId'),
              },
              {
                title: 'Location',
                dataIndex: 'locationName',
                key: 'locationName',
                width: 120,
                sorter: stringSorter('locationName'),
                ...getColumnSearchProps('locationName'),
              },
              {
                title: 'Country',
                dataIndex: 'countryName',
                key: 'countryName',
                width: 80,
                sorter: stringSorter('countryName'),
                ...getColumnSearchProps('countryName'),
              },
              {
                title: 'Screening Interview',
                dataIndex: 'interviews',
                width: 50,
                render: (value: any[]) => boolIconRenderer(!_.isEmpty(value) && _.every(value, 'isCompleted')),
              },
              {
                title: 'Repository',
                dataIndex: 'repository',
                key: 'repository',
                width: 80,
                render: value => (value ? <a href={value}>Link</a> : null),
              },
              {
                title: 'Total',
                dataIndex: 'totalScore',
                key: 'totalScore',
                width: 80,
                sorter: numberSorter('totalScore'),
                render: value => <Text strong>{value}</Text>,
              },
              {
                title: 'Actions',
                dataIndex: 'actions',
                render: (_, record: StudentDetails) => (
                  <>
                    {!record.repository && record.isActive && (
                      <Button
                        style={{ marginRight: '8px' }}
                        type="dashed"
                        onClick={() => this.handleCreateRepo(record)}
                      >
                        Create Repo
                      </Button>
                    )}
                    {record.isActive && (
                      <Button type="dashed" onClick={() => this.setState({ expelledStudent: record })}>
                        Expel
                      </Button>
                    )}
                  </>
                ),
              },
            ]}
          />
        </Spin>
        <style jsx>{styles}</style>
      </>
    );
  }

  private async handleCreateRepo({ githubId }: StudentDetails) {
    try {
      this.setState({ isLoading: true });
      const { repository } = await this.courseService.createRepository(githubId);
      const students = this.state.students.map(s => (s.githubId === githubId ? { ...s, repository: repository } : s));
      this.setState({ students, isLoading: false });
    } catch (e) {
      message.error('An error occured. Please try later.');
      this.setState({ isLoading: false });
    }
  }

  private handleCrossCheckDistribution = () => {
    this.setState({ crossCheckModal: 'distribution' });
  };

  private handleCrossCheckCompletion = () => {
    this.setState({ crossCheckModal: 'completion' });
  };

  private handleCrossCheckCancel = () => {
    this.setState({ crossCheckModal: null });
  };

  private handleCrossCheckSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    this.props.form.validateFields(async (err: any, values: any) => {
      if (err) {
        return;
      }
      try {
        if (this.state.crossCheckModal === 'distribution') {
          await this.courseService.createCrossCheckDistribution(values.courseTaskId);
        } else {
          await this.courseService.createCrossCheckCompletion(values.courseTaskId);
        }
        this.props.form.resetFields();
        message.success('Cross-check distrubtion has been created');
        this.setState({ crossCheckModal: null });
      } catch (e) {
        message.error('An error occurred.');
      }
    });
  };

  private async loadStudents() {
    const courseStudents = await this.courseService.getCourseStudentsWithDetails();
    let activeStudentCount = 0;
    const countries: Record<string, { count: number; totalCount: number }> = {};

    for (const courseStudent of courseStudents) {
      const { countryName } = courseStudent;
      if (!countries[countryName]) {
        countries[countryName] = { count: 0, totalCount: 0 };
      }
      countries[countryName].totalCount++;
      if (courseStudent.isActive) {
        activeStudentCount++;
        countries[countryName].count++;
      }
    }

    this.setState({
      students: courseStudents,
      stats: {
        activeStudentCount,
        studentCount: courseStudents.length,
        countries: _.keys(countries).map(k => ({
          name: k,
          count: countries[k].count,
          totalCount: countries[k].totalCount,
        })),
      },
    });
  }

  private handleCreateRepos = () => {
    try {
      this.courseService.createRepositories();
      message.info('The job for creating repositories has been submitted');
    } catch (e) {
      message.error('An error occured. Please try later.');
    }
  };
}

const styles = css`
  :global(.rs-table-row-disabled) {
    opacity: 0.25;
  }
`;

export default withCourseData(withSession(Form.create()(ScorePage)));

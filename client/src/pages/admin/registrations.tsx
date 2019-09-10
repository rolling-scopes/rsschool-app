import * as React from 'react';
import axios from 'axios';
import { Button, Col, Form, Icon, Result, Row, Select, Statistic, Table, Typography } from 'antd';
import { FormComponentProps } from 'antd/lib/form';

import { Course } from 'services/course';
import { formatMonthFriendly } from 'services/formatter';

import withSession, { Session } from 'components/withSession';
import withCourses from 'components/withCourses';
import { Header, GithubAvatar, LoadingScreen } from 'components';
import { stringSorter } from 'components/Table';

const defaultRowGutter = 24;
const PAGINATION = 100;
const DEFAULT_STATISTICS = { approved: 0, rejected: 0, pending: 0 };

type Props = {
  courses?: Course[];
  session?: Session;
} & FormComponentProps;

type State = {
  data: any[];
  courses: Course[];
  showSuccess: boolean;
  selectedIds: number[];
  isLoading: boolean;
  statistics: {
    approved: number;
    rejected: number;
    pending: number;
  };
};

interface Registration {
  id: number;
  status: string;
  user: {
    name: string;
    profileUrl: string;
  };
  github: {
    id: string;
    url: string;
  };
}

class RegistrationsPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const courses: Course[] = (this.props.courses || []).filter((course: Course) => course.planned);

    this.state = {
      courses,
      data: [],
      showSuccess: false,
      selectedIds: [],
      isLoading: true,
      statistics: { ...DEFAULT_STATISTICS },
    };
  }

  componentDidMount() {
    if (this.state.courses.length) {
      this.getRegistrations();
    }
  }

  changeSelection = (_: any, selectedRows: any) => {
    this.setState({ selectedIds: selectedRows.map((row: any) => row.id) });
  };

  getRegistrations = async (id?: number) => {
    const courseId = id || this.props.form.getFieldValue('courseId');
    const Url = `/api/registry?type=mentor&courseId=${courseId}`;
    const {
      data: { data: registrations },
    } = await axios.get(Url);
    const statistics = { ...DEFAULT_STATISTICS };

    for (let registration of registrations) {
      switch (registration.status) {
        case 'approved':
          statistics.approved += 1;
          break;
        case 'rejected':
          statistics.rejected += 1;
          break;
        case 'pending':
          statistics.pending += 1;
          break;
      }
    }

    this.setState({
      isLoading: false,
      data: registrations.map((registration: any) => {
        const {
          user,
          id,
          status,
          comment,
          attributes: { maxStudentsLimit },
        } = registration;
        const { firstName, lastName, githubId, contactsEpamEmail, locationName: city } = user || {
          firstName: '',
          lastName: '',
          githubId: '',
          contactsEpamEmail: '',
          locationName: '',
        };

        return {
          id,
          status,
          comment,
          githubId,
          maxStudentsLimit,
          user: { name: `${firstName} ${lastName}`, profileUrl: `/profile?githubId=${githubId}` },
          isFromEpam: !!contactsEpamEmail,
          city,
        };
      }),
      selectedIds: [],
      statistics,
    });
  };

  handleSubmit = async (_: any, status: string) => {
    const { selectedIds } = this.state;
    const courseId = this.props.form.getFieldValue('courseId');

    if (selectedIds.length) {
      try {
        this.setState({ isLoading: true });
        await axios.put('/api/registry', { ids: selectedIds, status });
        this.getRegistrations(courseId);
      } catch (e) {
        console.error(e);
      }
    }
  };

  approve = (e: any) => {
    this.handleSubmit(e, 'approved');
  };

  reject = async (e: any) => {
    this.handleSubmit(e, 'rejected');
  };

  render() {
    if (!this.props.session) {
      return null;
    }

    const { session } = this.props;
    const { courses, isLoading, data, statistics } = this.state;
    const { getFieldDecorator: field, getFieldValue } = this.props.form;
    const courseId = getFieldValue('courseId');
    const [description] = courses.filter(c => c.id === courseId).map(c => c.description);
    const rowSelection = {
      onChange: this.changeSelection,
    };

    return (
      <div>
        <Header username={session.githubId} />
        {!courses.length && (
          <Result
            status="info"
            icon={<Icon type="meh" theme="twoTone" />}
            title="There are no planned courses."
            subTitle="Please come back later."
            extra={
              <Button type="primary" href="/">
                Back to Home
              </Button>
            }
          />
        )}
        {courses.length && (
          <LoadingScreen show={isLoading}>
            <div className="m-3">
              <Col>
                <Row>
                  <Typography.Title level={4}>Registrations</Typography.Title>
                </Row>
                <Row gutter={defaultRowGutter}>
                  <Col span={10}>
                    <Form.Item>
                      {field('courseId', { initialValue: courses[0].id })(
                        <Select placeholder="Select course..." onChange={this.getRegistrations}>
                          {courses.map(course => (
                            <Select.Option key={course.id} value={course.id}>
                              {course.name} ({course.primarySkillName}, {formatMonthFriendly(course.startDate)})
                            </Select.Option>
                          ))}
                        </Select>,
                      )}
                    </Form.Item>
                    <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>
                  </Col>
                </Row>
                <Row gutter={defaultRowGutter}>
                  <Col span={12}>
                    <Button size="large" type="primary" onClick={this.approve}>
                      Approve
                    </Button>
                    <span>&nbsp;</span>
                    <Button size="large" type="danger" onClick={this.reject}>
                      Reject
                    </Button>
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="Approved"
                      value={statistics.approved}
                      valueStyle={{ color: '#3f8600' }}
                      prefix={<Icon type="like" />}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="Rejected"
                      value={statistics.rejected}
                      valueStyle={{ color: '#cf1322' }}
                      prefix={<Icon type="dislike" />}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic title="Pending" value={statistics.pending} prefix={<Icon type="hourglass" />} />
                  </Col>
                </Row>
                <Row gutter={defaultRowGutter}>
                  <Col>
                    <Table<Registration>
                      className="m-3"
                      bordered
                      pagination={{ pageSize: PAGINATION }}
                      size="small"
                      rowKey="id"
                      dataSource={data}
                      rowSelection={rowSelection}
                      columns={[
                        {
                          title: 'Name',
                          dataIndex: 'lastName',
                          key: 'lastName',
                          width: 150,
                          render: (_: any, record: Registration) => (
                            <a href={record.user.profileUrl}>{record.user.name}</a>
                          ),
                        },
                        {
                          title: 'Github',
                          dataIndex: 'githubId',
                          key: 'githubId',
                          width: 100,
                          render: (value: string) => (
                            <div className="d-flex flex-row">
                              <GithubAvatar githubId={value} size={24} />
                              &nbsp;<a href={`https://github.com/${value}`}>{value}</a>
                            </div>
                          ),
                        },
                        {
                          title: 'Status',
                          dataIndex: 'status',
                          key: 'status',
                          sorter: stringSorter('status'),
                          width: 50,
                        },
                        {
                          title: 'City',
                          dataIndex: 'city',
                          key: 'city',
                          width: 50,
                        },
                        {
                          title: 'Max students amount',
                          dataIndex: 'maxStudentsLimit',
                          key: 'maxStudentsLimit',
                          width: 100,
                        },
                        {
                          title: 'From EPAM',
                          dataIndex: 'isFromEpam',
                          key: 'isFromEpam',
                          width: 30,
                          render: (value: boolean) => (value ? 'Y' : 'N'),
                        },
                        { title: 'Comment', dataIndex: 'comment', key: 'comment', width: 100 },
                      ]}
                    />
                  </Col>
                </Row>
              </Col>
            </div>
          </LoadingScreen>
        )}
      </div>
    );
  }
}

export default withCourses(withSession(Form.create()(RegistrationsPage)));

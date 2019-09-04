import * as React from 'react';
import axios from 'axios';
import { Button, Checkbox, Col, Form, Icon, Result, Row, Select, Table, Typography } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

import { Course } from 'services/course';
import { formatMonthFriendly } from 'services/formatter';

import withSession, { Session } from 'components/withSession';
import withCourses from 'components/withCourses';
import { Header, GithubAvatar, LoadingScreen } from 'components';
import { stringSorter } from 'components/Table';

const defaultRowGutter = 24;
const PAGINATION = 100;
const notCheckboxFields = ['all', 'courseId'];

type Props = {
  courses?: Course[];
  session?: Session;
} & FormComponentProps;

type State = {
  data: any[];
  courses: Course[];
  showSuccess: boolean;
  isLoading: boolean;
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
      isLoading: true,
    };
  }

  componentDidMount() {
    if (this.state.courses.length) {
      this.getRegistrations();
    }
  }

  changeAll = ({ target: { checked } }: CheckboxChangeEvent) => {
    const { form } = this.props;
    const ids = Object.keys(form.getFieldsValue()).filter(key => !notCheckboxFields.includes(key));
    const newValues: any = {};

    for (let id of ids) {
      newValues[id] = checked;
    }

    form.setFieldsValue(newValues);
  };

  changeOne = ({ target: { checked, id } }: CheckboxChangeEvent) => {
    const { form } = this.props;
    const isAllChecked = this.props.form.getFieldValue('all');
    const newValue = !checked && isAllChecked ? { all: false } : {};

    form.setFieldsValue({ ...newValue, ...(id && { [id]: checked }) });
  };

  getRegistrations = async (id?: number) => {
    const courseId = id || this.props.form.getFieldValue('courseId');
    const Url = `/api/registry?type=mentor&courseId=${courseId}`;
    const {
      data: { data: registrations },
    } = await axios.get(Url);

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
        const { firstName, lastName, githubId } = user || { firstName: '', lastName: '', githubId: '' };

        return {
          id,
          status,
          comment,
          githubId,
          maxStudentsLimit,
          user: { name: `${firstName} ${lastName}`, profileUrl: `/profile?githubId=${githubId}` },
        };
      }),
    });
  };

  handleSubmit = async (e: any, status: string) => {
    e.preventDefault;
    const { form } = this.props;
    const formData = form.getFieldsValue();
    const courseId = form.getFieldValue('courseId');
    const ids = Object.keys(formData).filter(key => formData[key] && !notCheckboxFields.includes(key));

    if (ids.length) {
      try {
        this.setState({ isLoading: true });
        await axios.put('/api/registry', { ids, status });
        this.getRegistrations(courseId);
      } catch (e) {
        console.error(e);
      }
    }
  };

  approve = (e: any) => {
    this.handleSubmit(e, 'approve');
  };

  reject = async (e: any) => {
    this.handleSubmit(e, 'reject');
  };

  render() {
    if (!this.props.session) {
      return null;
    }

    const { session } = this.props;
    const { courses, isLoading, data } = this.state;
    const { getFieldDecorator: field, getFieldValue, getFieldDecorator } = this.props.form;
    const courseId = getFieldValue('courseId');
    const [description] = courses.filter(c => c.id === courseId).map(c => c.description);

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
                  <Col span={10}>
                    <Form.Item>
                      <Button size="large" type="primary" onClick={this.approve}>
                        Approve
                      </Button>
                      <span>&nbsp;</span>
                      <Button size="large" type="danger" onClick={this.reject}>
                        Reject
                      </Button>
                    </Form.Item>
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
                      columns={[
                        {
                          title: (
                            <Form.Item>
                              {getFieldDecorator('all', { valuePropName: 'checked' })(
                                <Checkbox onChange={this.changeAll} />,
                              )}
                            </Form.Item>
                          ),
                          dataIndex: 'id',
                          key: 'id',
                          width: 50,
                          render: (value: number) => (
                            <Form.Item>
                              {getFieldDecorator(`${value}`, { valuePropName: 'checked' })(
                                <Checkbox onChange={this.changeOne} />,
                              )}
                            </Form.Item>
                          ),
                        },
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
                          title: 'Max students amount',
                          dataIndex: 'maxStudentsLimit',
                          key: 'maxStudentsLimit',
                          width: 100,
                        },
                        { title: 'Comment', dataIndex: 'comment', key: 'comment', width: 100 },
                        {
                          title: 'Status',
                          dataIndex: 'status',
                          key: 'status',
                          sorter: stringSorter('status'),
                          width: 50,
                        },
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

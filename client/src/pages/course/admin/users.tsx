import { Button, Checkbox, Col, Form, Modal, Row, Table, Spin } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { GithubUserLink, Header, withSession } from 'components';
import { UserSearch } from 'components/UserSearch';
import withCourseData from 'components/withCourseData';
import * as React from 'react';
import { CourseService, CourseUser } from 'services/course';
import { CoursePageProps, PageWithModalState } from 'services/models';
import { UserService } from 'services/user';
import { boolIconRenderer } from 'components/Table';

type Props = CoursePageProps & FormComponentProps;

interface State extends PageWithModalState<CourseUser> {
  loading: boolean;
}

class CourseUsersPage extends React.Component<Props, State> {
  state: State = {
    data: [],
    loading: false,
    modalData: null,
    modalAction: 'update',
  };

  private courseService: CourseService;
  private userService = new UserService();

  constructor(props: Props) {
    super(props);
    this.courseService = new CourseService(props.course.id);
  }

  async componentDidMount() {
    await this.loadData();
  }

  async loadData() {
    this.setState({ loading: true });
    const data = await this.courseService.getUsers();
    this.setState({ data, loading: false });
  }

  private handleModalSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    this.props.form.validateFields(async (err: any, values: any) => {
      if (err) {
        return;
      }
      const data = {
        githubId: values.githubId,
        isManager: values.isManager,
        isJuryActivist: values.isJuryActivist,
        isSupervisor: values.isSupervisor,
      };

      this.state.modalAction === 'update'
        ? await this.courseService.updateUser(data.githubId, data)
        : await this.courseService.createUser(data.githubId, data);

      this.setState({ modalData: null });
      this.loadData();
    });
  };

  render() {
    return (
      <Spin spinning={this.state.loading}>
        <Header username={this.props.session.githubId} />
        <Button type="primary" className="mt-3 ml-3" onClick={this.handleAddItem}>
          Add User
        </Button>

        <Table
          className="m-3"
          rowKey="id"
          pagination={{ pageSize: 100 }}
          size="small"
          dataSource={this.state.data}
          columns={[
            { title: 'User Id', dataIndex: 'id' },
            { title: 'Name', dataIndex: 'name' },
            {
              title: 'Github',
              dataIndex: 'githubId',
              render: (value: string) => <GithubUserLink value={value} />,
            },
            {
              title: 'Manager',
              dataIndex: 'isManager',
              render: boolIconRenderer,
            },
            {
              title: 'Supervisor',
              dataIndex: 'isSupervisor',
              render: boolIconRenderer,
            },
            {
              title: 'Jury Activist',
              dataIndex: 'isJuryActivist',
              render: boolIconRenderer,
            },
            {
              title: 'Actions',
              dataIndex: 'actions',
              render: (_, record: CourseUser) => (
                <>
                  <a onClick={() => this.handleEditItem(record)}>Edit</a>{' '}
                </>
              ),
            },
          ]}
        />

        {this.renderModal()}
      </Spin>
    );
  }

  private renderModal() {
    const { getFieldDecorator: field } = this.props.form;
    const modalData = this.state.modalData as CourseUser;
    if (modalData == null) {
      return null;
    }
    return (
      <Modal
        visible={!!modalData}
        title="Course User"
        okText="Save"
        onOk={this.handleModalSubmit}
        onCancel={() => this.setState({ modalData: null })}
      >
        <Form layout="vertical">
          <Form.Item label="User">
            {field<CourseUser>('githubId', {
              initialValue: modalData.githubId,
              rules: [{ required: true, message: 'Please select an user' }],
            })(<UserSearch keyField="githubId" searchFn={this.loadUsers} />)}
          </Form.Item>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item>
                {field('isManager', { valuePropName: 'checked', initialValue: modalData.isManager })(
                  <Checkbox>Manager</Checkbox>,
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item>
                {field('isSupervisor', { valuePropName: 'checked', initialValue: modalData.isSupervisor })(
                  <Checkbox>Supervisor</Checkbox>,
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item>
                {field('isJuryActivist', { valuePropName: 'checked', initialValue: modalData.isJuryActivist })(
                  <Checkbox>Jury Activist</Checkbox>,
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }

  private loadUsers = async (searchText: string) => {
    return this.userService.searchUser(searchText);
  };

  private handleAddItem = () => this.setState({ modalData: {}, modalAction: 'create' });

  private handleEditItem = (record: CourseUser) => this.setState({ modalData: record, modalAction: 'update' });
}

export default withCourseData(withSession(Form.create()(CourseUsersPage)));

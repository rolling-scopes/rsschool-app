import * as React from 'react';
import moment from 'moment';
import {
  Table,
  Button,
  Modal,
  Checkbox,
  message,
  Col,
  Form,
  Row,
  Input,
  DatePicker,
  Radio,
  Select,
  Layout,
} from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Header, withSession, Session, AdminSider } from 'components';
import { dateRenderer, boolRenderer, stringTrimRenderer, stringSorter } from 'components/Table';
import { PageWithModalState, Course } from 'services/models';
import { PRIMARY_SKILLS } from 'services/reference-data';
import { CoursesService } from 'services/courses';

const { Content } = Layout;

type Props = { session: Session } & FormComponentProps;
interface State extends PageWithModalState<Course> {}

class CoursesPage extends React.Component<Props, State> {
  state: State = {
    data: [],
    modalData: null,
    modalAction: 'update',
  };

  private courseService = new CoursesService();

  async componentDidMount() {
    const data = await this.courseService.getCourses();
    this.setState({ data });
  }

  render() {
    return (
      <div>
        <Layout style={{ minHeight: '100vh' }}>
          <AdminSider />
          <Layout style={{ background: '#fff' }}>
            <Header title="Manage Courses" username={this.props.session.githubId} />
            <Content>
              <Button className="ml-3 mr-3 mt-3" type="primary" onClick={this.handleAddItem}>
                Add Course
              </Button>

              <Table
                className="m-3"
                size="small"
                dataSource={this.state.data}
                pagination={{ pageSize: 100 }}
                rowKey="id"
                columns={[
                  {
                    title: 'Id',
                    dataIndex: 'id',
                  },
                  {
                    title: 'Name',
                    dataIndex: 'name',
                    sorter: stringSorter<Course>('name'),
                  },
                  {
                    title: 'Full Name',
                    dataIndex: 'fullName',
                    sorter: stringSorter<Course>('fullName'),
                  },
                  {
                    title: 'Alias',
                    dataIndex: 'alias',
                    sorter: stringSorter<Course>('alias'),
                  },
                  {
                    title: 'Description',
                    dataIndex: 'description',
                    render: stringTrimRenderer,
                  },
                  {
                    title: 'Start Date',
                    dataIndex: 'startDate',
                    render: dateRenderer,
                  },
                  {
                    title: 'End Date',
                    dataIndex: 'endDate',
                    render: dateRenderer,
                  },
                  {
                    title: 'Primary Skill',
                    dataIndex: 'primarySkillName',
                  },
                  {
                    title: 'Completed',
                    dataIndex: 'completed',
                    render: boolRenderer,
                  },
                  {
                    title: 'Planned',
                    dataIndex: 'planned',
                    render: boolRenderer,
                  },
                  {
                    title: 'Invite Only',
                    dataIndex: 'inviteOnly',
                    render: boolRenderer,
                  },
                  {
                    title: 'Actions',
                    dataIndex: 'actions',
                    render: (_, record) => <a onClick={() => this.handleEditItem(record)}>Edit</a>,
                  },
                ]}
              />
            </Content>
          </Layout>
        </Layout>
        {this.renderModal()}
      </div>
    );
  }

  private renderModal() {
    const { getFieldDecorator: field } = this.props.form;
    const modalData = this.state.modalData as Course;
    if (modalData == null) {
      return null;
    }
    return (
      <Modal
        visible={!!modalData}
        title="Course"
        okText="Save"
        onOk={this.handleModalSubmit}
        onCancel={() => this.setState({ modalData: null })}
      >
        <Form layout="vertical">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Name">
                {field<Course>('name', {
                  initialValue: modalData.name,
                  rules: [{ required: true, message: 'Please enter name' }],
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Full Name">
                {field<Course>('fullName', {
                  initialValue: modalData.fullName,
                  rules: [{ required: true, message: 'Please enter full name' }],
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Alias">
                {field<Course>('alias', {
                  initialValue: modalData.alias,
                  rules: [{ required: true, message: 'Please enter alias' }],
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Description">
                {field<Course>('description', {
                  initialValue: modalData.description,
                  rules: [{ required: true, message: 'Please course description' }],
                })(<Input.TextArea />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Primary Skill">
                {field<Course>('primarySkillId', {
                  initialValue: modalData.primarySkillId,
                  rules: [{ required: true, message: 'Please select a primary skill' }],
                })(
                  <Select placeholder="Please select a primary skill">
                    {PRIMARY_SKILLS.map(skill => (
                      <Select.Option key={skill.id} value={skill.id}>
                        {skill.name}
                      </Select.Option>
                    ))}
                  </Select>,
                )}
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Start Date - End Date">
            {field('range', {
              initialValue:
                modalData.startDate && modalData.endDate
                  ? [
                      modalData.startDate ? moment(modalData.startDate) : null,
                      modalData.endDate ? moment(modalData.endDate) : null,
                    ]
                  : null,
              rules: [{ required: true, type: 'array', message: 'Please enter course date range' }],
            })(<DatePicker.RangePicker />)}
          </Form.Item>

          <Form.Item label="Registration End Date">
            {field('registrationEndDate', {
              initialValue: modalData.registrationEndDate ? moment(modalData.registrationEndDate) : null,
            })(<DatePicker />)}
          </Form.Item>

          <Form.Item label="Attributes">
            {field('state', { initialValue: modalData.completed ? 'completed' : modalData.planned ? 'planned' : null })(
              <Radio.Group>
                <Radio value={null}>Active</Radio>
                <Radio value="planned">Planned</Radio>
                <Radio value="completed">Completed</Radio>
              </Radio.Group>,
            )}
          </Form.Item>

          <Form.Item label="Invite Only">
            {field('inviteOnly', { initialValue: !!modalData.inviteOnly, valuePropName: 'checked' })(
              <Checkbox>Invite Only Course</Checkbox>,
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }

  private handleAddItem = () => this.setState({ modalData: {}, modalAction: 'create' });

  private handleEditItem = (record: Course) => this.setState({ modalData: record, modalAction: 'update' });

  private handleModalSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    this.props.form.validateFields(async (err: any, values: any) => {
      if (err) {
        return;
      }
      const [startDate, endDate] = values.range || [null, null];

      const data: Partial<Course> = {
        name: values.name,
        fullName: values.fullName,
        alias: values.alias,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        registrationEndDate: values.registrationEndDate ? values.registrationEndDate.toISOString() : null,
        completed: values.state === 'completed',
        planned: values.state === 'planned',
        inviteOnly: values.inviteOnly,
        description: values.description,
        primarySkillId: values.primarySkillId,
        primarySkillName: (PRIMARY_SKILLS.find(skill => skill.id === values.primarySkillId) || { name: '' }).name,
      };
      try {
        const course =
          this.state.modalAction === 'update'
            ? await this.courseService.updateCourse(this.state.modalData!.id!, data)
            : await this.courseService.createCourse(data);
        const updatedData =
          this.state.modalAction === 'update'
            ? this.state.data.map(d => (d.id === course.id ? { ...d, ...course } : d))
            : this.state.data.concat([course]);
        this.setState({ modalData: null, data: updatedData });
      } catch (e) {
        message.error('An error occurred. Can not save the task.');
      }
    });
  };
}

export default withSession(Form.create()(CoursesPage));

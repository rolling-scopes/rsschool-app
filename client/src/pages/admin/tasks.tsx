import * as React from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Checkbox, message, Select, Input, Modal, Radio, Table, Layout } from 'antd';
import { FormComponentProps } from 'antd/lib/form';

import { union } from 'lodash';
import { Header, Session, withSession, AdminSider } from 'components';
import { boolRenderer, tagsRenderer, stringSorter } from 'components/Table';
import { Task, TaskService } from 'services/task';
import { PageWithModalState } from 'services/models';
import { urlPattern, githubRepoUrl } from 'services/validators';

const { Content } = Layout;

type Props = { session: Session } & FormComponentProps;
interface State extends PageWithModalState<Task> {}

class TasksPage extends React.Component<Props, State> {
  state: State = {
    data: [],
    modalData: null,
    modalAction: 'update',
  };

  private taskService = new TaskService();

  async componentDidMount() {
    const data = await this.taskService.getTasks();
    this.setState({ data });
  }

  render() {
    return (
      <div>
        <Layout style={{ minHeight: '100vh' }}>
          <AdminSider />
          <Layout style={{ background: '#fff' }}>
            <Header title="Manage Tasks" username={this.props.session.githubId} />
            <Content>
              <Button type="primary" className="mt-3 mr-3 ml-3" onClick={this.handleAddItem}>
                Add Task
              </Button>
              <Table
                size="small"
                className="m-3"
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
                    sorter: stringSorter<Task>('name'),
                  },
                  {
                    title: 'Tags',
                    dataIndex: 'tags',
                    render: tagsRenderer,
                  },
                  {
                    title: 'Description URL',
                    dataIndex: 'descriptionUrl',
                  },
                  {
                    title: 'Github PR Required',
                    dataIndex: 'githubPrRequired',
                    render: boolRenderer,
                  },
                  {
                    title: 'Github Repo Name',
                    dataIndex: 'githubRepoName',
                  },
                  {
                    title: 'Verification',
                    dataIndex: 'verification',
                  },
                  {
                    title: 'Type',
                    dataIndex: 'type',
                  },
                  {
                    title: 'Actions',
                    dataIndex: 'actions',
                    render: (_, record) => <a onClick={() => this.handleEditItem(record)}>Edit</a>,
                  },
                ]}
              />
              {this.renderModal()}
            </Content>
          </Layout>
        </Layout>
      </div>
    );
  }

  private renderModal() {
    const { getFieldDecorator: field, getFieldValue } = this.props.form;
    const modalData = this.state.modalData as Task;

    if (modalData == null) {
      return null;
    }
    const isAutoTask = (getFieldValue('verification') || modalData.verification) === 'auto';
    const type = getFieldValue('type') || modalData.type;
    const allTags = union(...this.state.data.map(d => d.tags || []));
    return (
      <Modal
        visible={!!modalData}
        title="Task"
        okText="Save"
        onOk={this.handleModalSubmit}
        onCancel={() => this.setState({ modalData: null })}
      >
        <Form layout="vertical">
          <Form.Item label="Name">
            {field('name', {
              initialValue: modalData.name,
              rules: [{ required: true, message: 'Please enter stage name' }],
            })(<Input />)}
          </Form.Item>
          <Form.Item label="Tags">
            {field('tags', {
              initialValue: modalData.tags || [],
            })(
              <Select mode="tags">
                {allTags.map(tag => (
                  <Select.Option key={tag} value={tag}>
                    {tag}
                  </Select.Option>
                ))}
              </Select>,
            )}
          </Form.Item>
          <Form.Item label="Description URL">
            {field('descriptionUrl', {
              initialValue: modalData.descriptionUrl,
              rules: [
                {
                  required: true,
                  message: 'Please enter description URL',
                },
                {
                  message: 'Please enter valid URL',
                  pattern: urlPattern,
                },
              ],
            })(<Input />)}
          </Form.Item>

          <Form.Item label="Github">
            {field('githubPrRequired', { valuePropName: 'checked', initialValue: modalData.githubPrRequired })(
              <Checkbox>Github Pull Request required</Checkbox>,
            )}
          </Form.Item>
          <Form.Item label="Task Type">
            {field<Event>('type', {
              initialValue: modalData.type,
              rules: [{ required: true, message: 'Please select a type' }],
            })(
              <Select>
                <Select.Option value="jstask">JS task</Select.Option>
                <Select.Option value="htmltask">HTML task</Select.Option>
                <Select.Option value="htmlcssacademy">HTML/CSS Academy</Select.Option>
                <Select.Option value="codewars">Codewars</Select.Option>
                <Select.Option value="test">Test</Select.Option>
                <Select.Option value="codejam">Code Jam</Select.Option>
                <Select.Option value="interview">Interview</Select.Option>
              </Select>,
            )}
          </Form.Item>
          <Form.Item label="Verification">
            {field('verification', {
              initialValue: modalData.verification || 'manual',
            })(
              <Radio.Group>
                <Radio value="manual">Manual</Radio>
                <Radio value="auto">Auto</Radio>
              </Radio.Group>,
            )}
          </Form.Item>
          {isAutoTask && (
            <Form.Item label="Expected Github Repo Name">
              {field('githubRepoName', {
                initialValue: modalData.githubRepoName,
              })(<Input />)}
            </Form.Item>
          )}
          {isAutoTask && type === 'jstask' && (
            <Form.Item label="Source Github Repo Url">
              {field('sourceGithubRepoUrl', {
                initialValue: modalData.sourceGithubRepoUrl,
                rules: [{ required: true, message: 'Please enter Github Repo Url', pattern: githubRepoUrl }],
              })(<Input />)}
            </Form.Item>
          )}
        </Form>
      </Modal>
    );
  }

  private handleModalSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    this.props.form.validateFields(async (err: any, values: any) => {
      if (err) {
        return;
      }
      const data: Partial<Task> = {
        type: values.type,
        name: values.name,
        verification: values.verification,
        githubPrRequired: !!values.githubPrRequired,
        descriptionUrl: values.descriptionUrl,
        githubRepoName: values.githubRepoName,
        sourceGithubRepoUrl: values.sourceGithubRepoUrl,
        tags: values.tags,
      };
      try {
        const task =
          this.state.modalAction === 'update'
            ? await this.taskService.updateTask(this.state.modalData!.id!, data)
            : await this.taskService.createTask(data);
        const updatedData =
          this.state.modalAction === 'update'
            ? this.state.data.map(d => (d.id === task.id ? { ...d, ...task } : d))
            : this.state.data.concat([task]);
        this.setState({ modalData: null, data: updatedData });
      } catch (e) {
        message.error('An error occurred. Can not save the task.');
      }
    });
  };

  private handleAddItem = () => this.setState({ modalData: {}, modalAction: 'create' });

  private handleEditItem = (record: Task) => this.setState({ modalData: record, modalAction: 'update' });
}

export default withSession(Form.create()(TasksPage));

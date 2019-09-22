import * as React from 'react';
import { Button, Checkbox, message, Select, Form, Input, Modal, Radio, Table } from 'antd';
import { FormComponentProps } from 'antd/lib/form';

import { Header, Session, withSession } from 'components';
import { boolRenderer, stringSorter } from 'components/Table';
import { Task, TaskService } from 'services/task';
import { PageWithModalState } from 'services/models';
import { urlPattern, githubRepoUrl } from 'services/validators';

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
        <Header title="Manage Tasks" username={this.props.session.githubId} />
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
            {field('githubPrRequired', { initialValue: modalData.githubPrRequired })(
              <Checkbox>Github Pull Request required</Checkbox>,
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
            <Form.Item label="Type">
              {field('type', {
                initialValue: modalData.type,
              })(
                <Select placeholder="Please select a type">
                  <Select.Option value="jstask">JS Task</Select.Option>
                  <Select.Option value="htmltask">HTML Task</Select.Option>
                  <Select.Option value="external">External</Select.Option>
                </Select>,
              )}
            </Form.Item>
          )}
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
        name: values.name,
        verification: values.verification,
        githubPrRequired: !!values.githubPrRequired,
        descriptionUrl: values.descriptionUrl,
        githubRepoName: values.githubRepoName,
        sourceGithubRepoUrl: values.sourceGithubRepoUrl,
        type: values.type,
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

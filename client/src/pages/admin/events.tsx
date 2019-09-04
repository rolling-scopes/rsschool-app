import * as React from 'react';
import { Button, Select, message, Form, Input, Modal, Table } from 'antd';
import { FormComponentProps } from 'antd/lib/form';

import { Header, Session, withSession } from 'components';
import { stringSorter, stringTrimRenderer } from 'components/Table';
import { Event, EventService } from 'services/event';
import { PageWithModalState } from 'services/models';
import { urlPattern } from 'services/validators';

type Props = { session: Session } & FormComponentProps;
interface State extends PageWithModalState<Event> {}

class EventsPage extends React.Component<Props, State> {
  state: State = {
    data: [],
    modalData: null,
    modalAction: 'update',
  };

  private service = new EventService();

  async componentDidMount() {
    const data = await this.service.getEvents();
    this.setState({ data });
  }

  render() {
    return (
      <div>
        <Header title="Manage Events" username={this.props.session.githubId} />
        <Button type="primary" className="mt-3 mr-3 ml-3" onClick={this.handleAddItem}>
          Add Event
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
              sorter: stringSorter<Event>('name'),
            },
            {
              title: 'Description URL',
              dataIndex: 'descriptionUrl',
            },
            {
              title: 'Description',
              dataIndex: 'description',
              render: stringTrimRenderer,
            },
            {
              title: 'Type',
              dataIndex: 'type',
            },
            {
              title: 'Actions',
              dataIndex: 'actions',
              render: (_, record) => (
                <>
                  <span>
                    <a onClick={() => this.handleEditItem(record)}>Edit</a>{' '}
                  </span>
                  <span className="ml-1 mr-1">
                    <a onClick={() => this.handleDeleteItem(record.id)}>Delete</a>
                  </span>
                </>
              ),
            },
          ]}
        />
        {this.renderModal()}
      </div>
    );
  }

  private renderModal() {
    const { getFieldDecorator: field } = this.props.form;
    const modalData = this.state.modalData as Event;
    if (modalData == null) {
      return null;
    }
    return (
      <Modal
        visible={!!modalData}
        title="Event"
        okText="Save"
        onOk={this.handleModalSubmit}
        onCancel={() => this.setState({ modalData: null })}
      >
        <Form layout="vertical">
          <Form.Item label="Name">
            {field('name', {
              initialValue: modalData.name,
              rules: [{ required: true, message: 'Please enter event name' }],
            })(<Input />)}
          </Form.Item>
          <Form.Item label="Description URL">
            {field<Event>('descriptionUrl', {
              initialValue: modalData.descriptionUrl,
              rules: [
                {
                  message: 'Please enter valid URL',
                  pattern: urlPattern,
                },
              ],
            })(<Input />)}
          </Form.Item>
          <Form.Item label="Description">
            {field<Event>('description', {
              initialValue: modalData.description,
            })(<Input.TextArea />)}
          </Form.Item>
          <Form.Item label="Event Type">
            {field<Event>('type', {
              initialValue: modalData.type,
              rules: [{ required: true, message: 'Please select a type' }],
            })(
              <Select>
                <Select.Option value="lecture">Lecture</Select.Option>
                <Select.Option value="workshop">Workshop</Select.Option>
              </Select>,
            )}
          </Form.Item>
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
      const data: Partial<Event> = {
        name: values.name,
        description: values.description,
        descriptionUrl: values.descriptionUrl,
        type: values.type,
      };
      try {
        const task =
          this.state.modalAction === 'update'
            ? await this.service.updateEvent(this.state.modalData!.id!, data)
            : await this.service.createEvent(data);
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

  private handleEditItem = (record: Event) => this.setState({ modalData: record, modalAction: 'update' });

  private handleDeleteItem = async (id: number) => {
    await this.service.deleteEvent(id);
    const data = await this.service.getEvents();
    this.setState({ data });
  };
}

export default withSession(Form.create()(EventsPage));

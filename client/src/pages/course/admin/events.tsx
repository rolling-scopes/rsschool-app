import { Button, DatePicker, Input, Form, Col, Row, Modal, Select, Table, TimePicker } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Header, withSession } from 'components';
import { dateRenderer, timeRenderer, idFromArrayRenderer } from 'components/Table';
import withCourseData from 'components/withCourseData';
import moment from 'moment';
import * as React from 'react';
import { CourseEvent, CourseService } from 'services/course';
import { Event, EventService } from 'services/event';
import { formatDate, formatTime } from 'services/formatter';
import { CoursePageProps, PageWithModalState } from 'services/models';
import { Stage, StageService } from 'services/stage';

type Props = CoursePageProps & FormComponentProps;

interface State extends PageWithModalState<CourseEvent> {
  events: Event[];
  stages: Stage[];
}

class CourseEventsPage extends React.Component<Props, State> {
  state: State = {
    events: [],
    data: [],
    stages: [],
    modalData: null,
    modalAction: 'update',
  };

  private timeZoneOffset = moment().format('Z');

  private courseService = new CourseService();

  async componentDidMount() {
    const courseId = this.props.course.id;
    const [data, stages, events] = await Promise.all([
      this.courseService.getCourseEvents(courseId),
      new StageService().getCourseStages(courseId),
      new EventService().getEvents(),
    ]);
    this.setState({ data, stages, events });
  }

  private handleModalSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    this.props.form.validateFields(async (err: any, values: any) => {
      if (err) {
        return;
      }
      const data = {
        place: values.place,
        date: values.date ? formatDate(values.date) : undefined,
        time: values.time ? formatTime(values.time) : undefined,
        eventId: values.eventId,
        stageId: values.stageId,
        comment: values.comment,
        courseId: this.props.course.id,
        coordinator: values.coordinator,
      };
      const record =
        this.state.modalAction === 'update'
          ? await this.courseService.updateCourseEvent(this.props.course.id, this.state.modalData!.id!, data)
          : await this.courseService.createCourseEvent(this.props.course.id, data);

      const updatedData =
        this.state.modalAction === 'update'
          ? this.state.data.map(d => (d.id === record.id ? { ...d, ...record } : d))
          : this.state.data.concat([record]);
      this.setState({ modalData: null, data: updatedData });
    });
  };

  render() {
    if (!this.props.session) {
      return null;
    }
    return (
      <div>
        <Header username={this.props.session.githubId} />
        <Button type="primary" className="mt-3 ml-3" onClick={this.handleAddItem}>
          Add Event
        </Button>
        <Table
          className="m-3"
          rowKey="id"
          pagination={{ pageSize: 100 }}
          size="small"
          dataSource={this.state.data}
          columns={[
            { title: 'Id', dataIndex: 'id' },
            {
              title: 'Name',
              dataIndex: 'eventId',
              render: idFromArrayRenderer(this.state.events),
            },
            { title: 'Type', dataIndex: 'event.type' },
            { title: 'Date', dataIndex: 'date', render: dateRenderer },
            { title: 'Time', dataIndex: 'time', render: timeRenderer },
            { title: 'Place', dataIndex: 'place' },
            { title: 'Coordinator', dataIndex: 'coordinator' },
            { title: 'Comment', dataIndex: 'comment' },
            {
              title: 'Stage',
              dataIndex: 'stageId',
              render: idFromArrayRenderer(this.state.stages),
            },
            {
              title: 'Actions',
              dataIndex: 'actions',
              render: (_, record: CourseEvent) => (
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
    const { events, stages } = this.state;
    const modalData = this.state.modalData as CourseEvent;
    if (modalData == null) {
      return null;
    }
    return (
      <Modal
        visible={!!modalData}
        title="Course Event"
        okText="Save"
        onOk={this.handleModalSubmit}
        onCancel={() => this.setState({ modalData: null })}
      >
        <Form layout="vertical">
          <Form.Item label="Event">
            {field<CourseEvent>('eventId', {
              initialValue: modalData.eventId,
              rules: [{ required: true, message: 'Please select an event' }],
            })(
              <Select placeholder="Please select an event">
                {events.map(event => (
                  <Select.Option key={event.id} value={event.id}>
                    {event.name}
                  </Select.Option>
                ))}
              </Select>,
            )}
          </Form.Item>
          <Form.Item label="Stage">
            {field<CourseEvent>('stageId', {
              initialValue: modalData.stageId,
              rules: [{ required: true, message: 'Please select a stage' }],
            })(
              <Select placeholder="Please select a stage">
                {stages.map((stage: Stage) => (
                  <Select.Option key={stage.id} value={stage.id}>
                    {stage.name}
                  </Select.Option>
                ))}
              </Select>,
            )}
          </Form.Item>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Date">
                {field('date', {
                  initialValue: modalData.date ? moment(modalData.date) : null,
                  rules: [{ required: true, message: 'Please enter date' }],
                })(<DatePicker />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Time">
                {field('time', {
                  initialValue: modalData.time ? moment(modalData.time, 'HH:mm:ssZ') : null,
                })(<TimePicker format="HH:mm" />)}{' '}
                {this.timeZoneOffset}
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Place">
            {field<CourseEvent>('place', { initialValue: modalData.place })(<Input />)}
          </Form.Item>
          <Form.Item label="Coordinator">
            {field<CourseEvent>('coordinator', { initialValue: modalData.coordinator })(<Input />)}
          </Form.Item>
          <Form.Item label="Comment">
            {field<CourseEvent>('comment', { initialValue: modalData.comment })(<Input.TextArea />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }

  private handleAddItem = () => this.setState({ modalData: {}, modalAction: 'create' });

  private handleEditItem = (record: CourseEvent) => this.setState({ modalData: record, modalAction: 'update' });

  private handleDeleteItem = async (id: number) => {
    await this.courseService.deleteCourseEvent(this.props.course.id, id);
    const records = await this.courseService.getCourseEvents(this.props.course.id);
    this.setState({ data: records });
  };
}

export default withCourseData(withSession(Form.create()(CourseEventsPage)));

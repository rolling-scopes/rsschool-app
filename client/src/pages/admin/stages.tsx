import { Button, DatePicker, message, Form, Input, Modal, Table, Select } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Header } from 'components/Header';
import withSession, { Session } from 'components/withSession';
import moment from 'moment';
import * as React from 'react';
import { CourseService, Course } from 'services/course';
import { Stage, StageService } from 'services/stage';
import { dateRenderer, idFromArrayRenderer, stringSorter } from 'components/Table';
import { formatDate } from 'services/formatter';
import { PageWithModalState } from 'services/models';

type Props = { session: Session } & FormComponentProps;

interface State extends PageWithModalState<Stage> {
  courses: Course[];
}

class StagesPage extends React.Component<Props, State> {
  state: State = {
    data: [],
    courses: [],
    modalData: null,
    modalAction: 'update',
  };

  private stageService = new StageService();
  private courseService = new CourseService();

  async componentDidMount() {
    const [data, courses] = await Promise.all([this.stageService.getStages(), this.courseService.getCourses()]);
    this.setState({ data: data.sort((a, b) => a.id - b.id), courses });
  }

  render() {
    return (
      <div>
        <Header title="Manage Stages" username={this.props.session.githubId} />

        <Button type="primary" className="mt-3 mr-3 ml-3" onClick={this.handleAddItem}>
          Add Stage
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
              sorter: stringSorter<Stage>('name'),
            },
            {
              title: 'Course',
              dataIndex: 'courseId',
              render: idFromArrayRenderer(this.state.courses),
              sorter: stringSorter<Stage>('courseId'),
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
    const { getFieldDecorator: field } = this.props.form;
    const { courses } = this.state;
    const modalData = this.state.modalData as Stage;
    if (modalData == null) {
      return null;
    }
    return (
      <Modal
        visible={!!modalData}
        title="Stage"
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
          <Form.Item label="Course">
            {field('courseId', {
              initialValue: modalData.courseId,
              rules: [{ required: true, message: 'Please select a course' }],
            })(
              <Select placeholder="Please select a course">
                {courses.map((course: Course) => (
                  <Select.Option key={course.id} value={course.id}>
                    {course.name}
                  </Select.Option>
                ))}
              </Select>,
            )}
          </Form.Item>
          <Form.Item label="Start Date - End Date">
            {field('range', {
              initialValue:
                modalData.startDate && modalData.endDate
                  ? [
                      modalData.startDate ? moment(modalData.startDate) : null,
                      modalData.endDate ? moment(modalData.endDate) : null,
                    ]
                  : null,
              rules: [{ required: true, type: 'array', message: 'Please enter course start and end date' }],
            })(<DatePicker.RangePicker />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }

  private handleAddItem = () => this.setState({ modalData: {}, modalAction: 'create' });

  private handleEditItem = (record: Stage) => this.setState({ modalData: record, modalAction: 'update' });

  private handleModalSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    this.props.form.validateFields(async (err: any, values: any) => {
      if (err) {
        return;
      }
      const [startDate, endDate] = values.range || [null, null];
      const data: Partial<Stage> = {
        name: values.name,
        startDate: startDate ? formatDate(startDate) : null,
        endDate: endDate ? formatDate(endDate) : null,
        courseId: values.courseId,
      };
      try {
        const stage =
          this.state.modalAction === 'update'
            ? await this.stageService.updateStage(this.state.modalData!.id!, data)
            : await this.stageService.createStage(data);
        const updatedData =
          this.state.modalAction === 'update'
            ? this.state.data.map(d => (d.id === stage.id ? { ...d, ...stage } : d))
            : this.state.data.concat([stage]);
        this.setState({ modalData: null, data: updatedData });
      } catch (e) {
        message.error('An error occurred. Can not save the stage.');
      }
    });
  };
}

export default withSession(Form.create()(StagesPage));

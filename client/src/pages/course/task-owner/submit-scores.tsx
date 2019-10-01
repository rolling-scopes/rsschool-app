import { Button, Col, Form, Select, Upload, Icon, message, Spin, Table, List, Typography } from 'antd';
import csv from 'csvtojson';
import { isUndefined } from 'lodash';
import { FormComponentProps } from 'antd/lib/form';
import { Header, withSession } from 'components';
import withCourseData from 'components/withCourseData';
import * as React from 'react';
import { CourseService, CourseTask } from 'services/course';
import { CoursePageProps } from 'services/models';
import { filterLogin } from 'utils/text-utils';
import { UploadFile } from 'antd/lib/upload/interface';

type Props = CoursePageProps & FormComponentProps;

interface SubmitResult {
  status: string;
  count: number;
  messages?: string[];
}

type State = {
  courseTasks: CourseTask[];
  submitResults: SubmitResult[];
  isLoading: boolean;
  isPowerMentor: boolean;
  selectedFileList: Map<string, UploadFile>;
};

class TaskScorePage extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
    isPowerMentor: false,
    submitResults: [],
    courseTasks: [],
    selectedFileList: new Map(),
  };

  courseService = new CourseService();

  async componentDidMount() {
    const courseId = this.props.course.id;

    const courseTasks = await this.courseService.getCourseTasksForTaskOwner(courseId);

    this.setState({ courseTasks });
  }

  render() {
    const { getFieldDecorator: field } = this.props.form;
    const { isLoading, submitResults } = this.state;
    const [skipped] = submitResults.filter(({ status }) => status === 'skipped');
    const skippedStudents = skipped && skipped.messages ? skipped.messages : [];

    const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
    return (
      <>
        <Header title="Submit Scores" courseName={this.props.course.name} username={this.props.session.githubId} />
        <Col className="m-2" sm={12}>
          <Form onSubmit={this.handleSubmit} layout="vertical">
            <Form.Item label="Task">
              {field('courseTaskId', { rules: [{ required: true, message: 'Please select a task' }] })(
                <Select size="large" placeholder="Select task" onChange={this.handleTaskChange}>
                  {this.state.courseTasks.map(task => (
                    <Select.Option key={task.id} value={task.id}>
                      {task.name}
                    </Select.Option>
                  ))}
                </Select>,
              )}
            </Form.Item>
            <Form.Item label="CSV File">
              <h3>Uploading rules</h3>
              <List
                size="small"
                bordered
                dataSource={[
                  'CSV-file should contain columns "Score" and "Github".',
                  '"Github" fields could be links or plain names.',
                  'For duplicated "Github" fields the best score would be counted.',
                  'You should upload several files, if you need scoring the best result from two or more tests.',
                  'Only students in the file would be scored. By the way, you can update just several scores.',
                ]}
                renderItem={(item, idx) => (
                  <List.Item>
                    <Typography.Text strong>{idx + 1}</Typography.Text> {item}
                  </List.Item>
                )}
                style={{ marginBottom: '1em' }}
              />
              {field('files', { rules: [{ required: true, message: 'Please select csv-file' }] })(
                <Upload
                  fileList={Array.from(this.state.selectedFileList).map(([, file]) => file)}
                  onChange={this.handleFileChose}
                  multiple={true}
                >
                  <Button>
                    <Icon type="upload" /> Select files
                  </Button>
                </Upload>,
              )}
            </Form.Item>
            <Form.Item>
              <Button size="large" type="primary" htmlType="submit" style={{ marginRight: '1.5em' }}>
                Submit
              </Button>
              {isLoading ? <Spin indicator={antIcon} style={{ fontSize: 20 }} /> : ''}
            </Form.Item>
            {submitResults.length ? (
              <Form.Item>
                <h3>Summary</h3>
                <Table
                  pagination={false}
                  dataSource={submitResults}
                  size="small"
                  rowKey="status"
                  columns={[
                    {
                      title: 'Status',
                      dataIndex: 'status',
                    },
                    {
                      title: 'Count',
                      dataIndex: 'count',
                    },
                  ]}
                />
              </Form.Item>
            ) : (
              ''
            )}
            {skippedStudents.length ? (
              <Form.Item>
                <h3>Skipped students</h3>
                <List
                  size="small"
                  bordered
                  dataSource={skippedStudents}
                  renderItem={item => <List.Item>{item}</List.Item>}
                  style={{ marginBottom: '1em' }}
                />
              </Form.Item>
            ) : (
              ''
            )}
          </Form>
        </Col>
      </>
    );
  }

  private handleTaskChange = () => this.setState({ submitResults: [] });

  private handleFileChose = (info: any) => {
    let newSelectedFileList: Map<string, UploadFile> = new Map(this.state.selectedFileList);
    switch (info.file.status) {
      case 'uploading':
      case 'done': {
        newSelectedFileList.set(info.file.uid, info.file);
        break;
      }
      case 'removed': {
        newSelectedFileList.delete(info.file.uid);
        break;
      }
      default: {
        newSelectedFileList = new Map();
      }
    }
    this.setState({ selectedFileList: newSelectedFileList, submitResults: [] });
  };

  private handleSubmit = async (e: any) => {
    e.preventDefault();
    this.props.form.validateFields(async (err: any, values: any) => {
      if (err) {
        return;
      }
      try {
        await this.setState({ isLoading: true });
        const courseId = this.props.course.id;
        const files = values.files.fileList;

        const filesContent: string[] = await Promise.all(
          files.map(
            (file: any) =>
              new Promise((res, rej) => {
                const reader = new FileReader();
                reader.readAsText(file.originFileObj, 'utf-8');
                reader.onload = ({ target }) => res(target ? target.result : '');
                reader.onerror = e => rej(e);
              }),
          ),
        );

        const scores = (await Promise.all(filesContent.map((content: string) => csv().fromString(content))))
          .reduce((acc, cur) => acc.concat(cur), [])
          .map(item => {
            if (isUndefined(item.Github) || isUndefined(item.Score)) {
              throw new Error('Incorrect data: CSV file should content the headers named "Github" and "Score"!');
            }
            return {
              score: parseInt(item.Score, 10),
              github: filterLogin(item.Github).toLowerCase(),
            };
          });

        const uniqueStudents = new Map();
        scores.forEach(({ github, score }) => {
          if (uniqueStudents.has(github)) {
            const savedScore = uniqueStudents.get(github);
            if (savedScore < score) {
              uniqueStudents.set(github, score);
            }
          } else {
            uniqueStudents.set(github, score);
          }
        });

        const data = Array.from(uniqueStudents).map(([github, score]) => ({
          score,
          studentGithubId: github,
        }));

        const results = await this.courseService.postMultipleScores(courseId, values.courseTaskId, data);
        const groupedByStatus = new Map();
        results.forEach(({ status, value }: { status: string; value: string | number }) => {
          if (groupedByStatus.has(status)) {
            const savedStatus = groupedByStatus.get(status);
            const newStatus = {
              status,
              count: savedStatus.count + 1,
            } as SubmitResult;
            if (status === 'skipped' && typeof value === 'string') {
              newStatus.messages = savedStatus.messages.concat([value]);
            }
            groupedByStatus.set(status, newStatus);
          } else {
            const newStatus = {
              status,
              count: 1,
            } as SubmitResult;
            if (status === 'skipped' && typeof value === 'string') {
              newStatus.messages = [value];
            }
            groupedByStatus.set(status, newStatus);
          }
        });
        const submitResults = Array.from(groupedByStatus).map(([, submitResult]) => submitResult);

        await this.setState({ submitResults, isLoading: false });
        message.success('Score has been submitted.');
        this.props.form.resetFields();
        this.setState({ selectedFileList: new Map() });
      } catch (e) {
        this.setState({ isLoading: false });
        if (e.message.match(/^Incorrect data/)) {
          message.error(e.message);
        } else {
          message.error('An error occured. Please try later.');
        }
      }
    });
  };
}

export default withCourseData(withSession(Form.create()(TaskScorePage), 'mentor'));

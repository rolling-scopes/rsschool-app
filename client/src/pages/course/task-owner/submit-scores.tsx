import { Button, Col, Form, Select, Upload, Icon, message } from 'antd';
import csv from 'csvtojson';
import { FormComponentProps } from 'antd/lib/form';
import { Header, withSession } from 'components';
import withCourseData from 'components/withCourseData';
import * as React from 'react';
import { CourseService, CourseTask } from 'services/course';
import { sortTasksByEndDate } from 'services/rules';
import { CoursePageProps } from 'services/models';
import { filterLogin } from 'utils/text-utils';

type Props = CoursePageProps & FormComponentProps;

type State = {
  courseTasks: CourseTask[];
  isLoading: boolean;
  isPowerMentor: boolean;
};

class TaskScorePage extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
    isPowerMentor: false,
    courseTasks: [],
  };

  courseService = new CourseService();

  async componentDidMount() {
    const courseId = this.props.course.id;

    const courseTasks = await this.courseService.getCourseTasks(courseId);

    const filteredCourseTasks = courseTasks
      .sort(sortTasksByEndDate)
      .filter(task => task.checker === 'taskOwner');

    this.setState({ courseTasks: filteredCourseTasks });
  }

  render() {
    const { getFieldDecorator: field } = this.props.form;
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
              {field('files', { rules: [{ required: true, message: 'Please select csv-file'  }] })(
                <Upload>
                  <Button>
                    <Icon type="upload" /> Select files
                  </Button>
                </Upload>,
              )}
            </Form.Item>
            <Button size="large" type="primary" htmlType="submit">
              Submit
            </Button>
          </Form>
        </Col>
      </>
    );
  }

  private handleTaskChange = async (value: number) => {
    console.log(value);
  };

  private handleSubmit = async (e: any) => {
    e.preventDefault();
    this.props.form.validateFields(async (err: any, values: any) => {
      if (err) {
        return;
      }
      try {
        this.setState({ isLoading: true });
        const courseId = this.props.course.id;

        const files = values.files.fileList;
        console.log(files);

        const filesContent: string[] = await Promise.all(files.map((file: any) => new Promise((res, rej) => {
          const reader = new FileReader();
          reader.readAsText(file.originFileObj, 'utf-8');
          reader.onload = ({ target }) => res(target ? target.result : '');
          reader.onerror = e => rej(e);
        })));

        const scores = (await Promise.all(filesContent.map((content: string) => csv().fromString(content))))
          .reduce((acc, cur) => acc.concat(cur), [])
          .map(item => ({
            score: parseInt(item.Score, 10),
            github: filterLogin(item.Github).toLowerCase(),
          }));

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

        const data = Array.from(uniqueStudents)
          .map(([github, score]) => ({
            score,
            studentGithubId: github,
            courseTaskId: values.courseTaskId,
          }));

        console.log(data);

        const result = await this.courseService.postMultipleScores(courseId, data);

        console.log(result);
        // TODO: make loader and show list of student's names that hasn't been scored

        this.setState({ isLoading: false });
        message.success('Score has been submitted.');
        this.props.form.resetFields();
      } catch (e) {
        this.setState({ isLoading: false });
        message.error('An error occured. Please try later.');
      }
    });
  };
}

export default withCourseData(withSession(Form.create()(TaskScorePage), 'mentor'));

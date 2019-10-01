import { Button, Col, Form, Input, InputNumber, message, Select } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Header, PersonSelect, withSession } from 'components';
import withCourseData from 'components/withCourseData';
import * as React from 'react';
import { AssignedStudent, CourseService, CourseTask } from 'services/course';
import { sortTasksByEndDate } from 'services/rules';
import { CoursePageProps } from 'services/models';
import { StudentBasic } from '../../../../../common/models';

type Props = CoursePageProps & FormComponentProps;

type State = {
  students: StudentBasic[];
  courseTasks: CourseTask[];
  isLoading: boolean;
  isPowerMentor: boolean;
};

class TaskScorePage extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
    isPowerMentor: false,
    students: [],
    courseTasks: [],
  };

  allStudents: {
    students: StudentBasic[];
    assignedStudents: AssignedStudent[];
  } | null = null;
  courseService = new CourseService();

  async componentDidMount() {
    const courseId = this.props.course.id;
    const { isAdmin, roles } = this.props.session;
    const isCourseManager = roles[courseId] === 'coursemanager';
    const isPowerMentor = isAdmin || isCourseManager;

    const students = isPowerMentor
      ? this.courseService.getCourseStudents(courseId, true).then(students => ({
          students,
          assignedStudents: [],
        }))
      : this.courseService.getAllMentorStudents(courseId);

    const [allStudents, courseTasks] = await Promise.all([students, this.courseService.getCourseTasks(courseId)]);
    this.allStudents = allStudents;

    const filteredCourseTasks = courseTasks
      .sort(sortTasksByEndDate)
      .filter(task => task.studentEndDate && task.verification !== 'auto' && !task.useJury);

    this.setState({ isPowerMentor, courseTasks: filteredCourseTasks });
  }

  render() {
    const { getFieldDecorator: field, getFieldValue } = this.props.form;
    return (
      <>
        <Header title="Submit Review" courseName={this.props.course.name} username={this.props.session.githubId} />
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
            <Form.Item label="Student">
              {field('studentId', { rules: [{ required: true, message: 'Please select a student' }] })(
                <PersonSelect data={this.state.students} disabled={!getFieldValue('courseTaskId')} />,
              )}
            </Form.Item>
            <Form.Item label="Github Pull Request URL">
              {field('githubPrUrl', {
                rules: [
                  {
                    message: 'Please enter a valid Github Pull Request URL',
                    pattern: /https:\/\/github.com\/(\w|\d|\-)+\/(\w|\d|\-)+\/pull\/(\d)+/gi,
                  },
                ],
              })(<Input size="large" />)}
            </Form.Item>
            <Form.Item label="Score">
              {field('score', {
                rules: [
                  {
                    required: true,
                    message: 'Please enter task score',
                  },
                ],
              })(<InputNumber size="large" step={1} />)}
            </Form.Item>
            <Form.Item label="Comment">{field('comment')(<Input.TextArea />)}</Form.Item>
            <Button size="large" type="primary" htmlType="submit">
              Submit
            </Button>
          </Form>
        </Col>
      </>
    );
  }

  private handleTaskChange = async (value: number) => {
    const courseTaskId = Number(value);
    const courseTask = this.state.courseTasks.find(t => t.courseTaskId === courseTaskId);
    if (courseTask == null || this.allStudents == null) {
      return;
    }
    if (this.state.isPowerMentor) {
      this.setState({ students: this.allStudents.students });
      return;
    }
    if (courseTask.checker !== 'mentor') {
      this.setState({
        students: this.allStudents.assignedStudents
          .filter(s => s.courseTaskId === courseTaskId)
          .filter(student => student.isActive),
      });
      return;
    }
    this.setState({ students: this.allStudents.students.filter(student => student.isActive) });
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
        const { studentId, ...data } = values;
        await this.courseService.postStudentScore(courseId, studentId, data);

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

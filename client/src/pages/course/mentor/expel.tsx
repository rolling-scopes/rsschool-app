import { Button, Form, Input, message, Col, Typography } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Header } from 'components/Header';
import withCourseData from 'components/withCourseData';
import withSession, { Session } from 'components/withSession';
import * as React from 'react';
import { Course, CourseService } from 'services/course';
import { StudentBasic } from '../../../../../common/models';

import { PersonSelect } from 'components/PersonSelect';

type Props = {
  session: Session;
  course: Course;
} & FormComponentProps;

type State = {
  students: StudentBasic[];
  isLoading: boolean;
};

class ExpelPage extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
    students: [],
  };
  private courseService = new CourseService();

  async componentDidMount() {
    const courseId = this.props.course.id;
    let students = [];
    const isPowerUser = this.courseService.isPowerUser(courseId, this.props.session);
    if (isPowerUser) {
      students = await this.courseService.getCourseStudents(courseId, true);
    } else {
      const [mentorStudents, interviewStudents] = await Promise.all([
        this.courseService.getMentorStudents(courseId),
        this.courseService.getInterviewStudents(courseId),
      ]);
      students = mentorStudents.concat(interviewStudents);
    }
    const activeStudents = students.filter(student => student.isActive);
    this.setState({ students: activeStudents });
  }

  handleSubmit = async (e: any) => {
    e.preventDefault();

    this.props.form.validateFields(async (err: any, values: any) => {
      if (err || !values.studentId) {
        return;
      }
      try {
        this.setState({ isLoading: true });
        await this.courseService.expelStudent(this.props.course.id, Number(values.studentId), values.comment);
        message.success('The student has been expelled');
        this.setState({ isLoading: false });
        this.props.form.resetFields();
      } catch (e) {
        message.error('An error occured. Please try later.');
        this.setState({ isLoading: false });
      }
    });
  };

  render() {
    const { getFieldDecorator: field } = this.props.form;
    return (
      <>
        <Header username={this.props.session.githubId} courseName={this.props.course.name} />
        <Col className="m-2" sm={12}>
          <div className="mb-3">
            <Typography.Text type="warning">This page allows to expel a student from the course</Typography.Text>
          </div>
          <Form onSubmit={this.handleSubmit} layout="vertical">
            <Form.Item label="Student">
              {field('studentId', { rules: [{ required: true, message: 'Please select a student' }] })(
                <PersonSelect data={this.state.students} />,
              )}
            </Form.Item>
            <Form.Item label="Reason for expelling">
              {field('comment', {
                rules: [{ required: true, message: 'Please give us a couple words why you are expelling the student' }],
              })(<Input.TextArea />)}
            </Form.Item>
            <Button size="large" type="primary" htmlType="submit">
              Submit
            </Button>
          </Form>
        </Col>
      </>
    );
  }
}

export default withCourseData(withSession(Form.create({ name: 'expelPage' })(ExpelPage), 'mentor'));

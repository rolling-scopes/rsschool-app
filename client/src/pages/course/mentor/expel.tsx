import { Button, Col, Form, Input, message, Typography } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Header, UserSearch } from 'components';
import withCourseData from 'components/withCourseData';
import withSession, { Session } from 'components/withSession';
import { uniqBy } from 'lodash';
import * as React from 'react';
import { CourseService } from 'services/course';
import { Course } from 'services/models';
import { StudentBasic } from '../../../../../common/models';

type Props = {
  session: Session;
  course: Course;
} & FormComponentProps;

type State = {
  isLoading: boolean;
  students: StudentBasic[];
};

class ExpelPage extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
    students: [],
  };

  private courseService: CourseService;

  constructor(props: Props) {
    super(props);
    this.courseService = new CourseService(props.course.id);
  }

  async componentDidMount() {
    let students: StudentBasic[] = [];
    try {
      const [mentorStudents, interviewStudents] = await Promise.all([
        this.courseService.getMentorStudents(),
        this.courseService.getInterviewStudents(),
      ]);
      students = uniqBy(mentorStudents.concat(interviewStudents), 'id');
    } catch (error) {
      console.error(error);
    }

    const activeStudents = students.filter(student => student.isActive);
    this.setState({ students: activeStudents });
  }

  private loadStudents = async (searchText: string) => {
    return this.state.students.filter(({ githubId, name }) => `${githubId} ${name}`.match(searchText));
  };

  handleSubmit = async (e: any) => {
    e.preventDefault();

    this.props.form.validateFields(async (err: any, values: any) => {
      if (err || !values.githubId || this.state.isLoading) {
        return;
      }
      try {
        this.setState({ isLoading: true });
        await this.courseService.expelStudent(values.githubId, values.comment);
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
        <Col className="m-2" sm={16} md={12} lg={8}>
          <div className="mb-3">
            <Typography.Text type="warning">This page allows to expel a student from the course</Typography.Text>
          </div>
          <Form onSubmit={this.handleSubmit} layout="vertical">
            <Form.Item label="Student">
              {field('githubId', { rules: [{ required: true, message: 'Please select a student' }] })(
                <UserSearch keyField="githubId" defaultValues={this.state.students} searchFn={this.loadStudents} />,
              )}
            </Form.Item>
            <Form.Item label="Reason for expelling">
              {field('comment', {
                rules: [{ required: true, message: 'Please give us a couple words why you are expelling the student' }],
              })(<Input.TextArea style={{ height: 150 }} />)}
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

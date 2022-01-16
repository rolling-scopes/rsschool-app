import { Button, Modal, Row, Typography, message } from 'antd';
import * as React from 'react';
import { StudentSearch } from 'components/StudentSearch';
import { CourseService } from 'services/course';

const { Text } = Typography;

type State = {
  isModalOpened: boolean;
  studentGithubId: string | null;
};

type Props = {
  mentorGithuId: string;
  courseId: number;
};

class AssignStudentModal extends React.PureComponent<Props, State> {
  state: State = {
    isModalOpened: false,
    studentGithubId: null,
  };

  openModal = () => {
    this.setState({ isModalOpened: true });
  };

  closeModal = () => {
    this.setState({ isModalOpened: false });
  };

  addStudent = async () => {
    const { mentorGithuId } = this.props;
    const { studentGithubId } = this.state;

    if (!studentGithubId) {
      return;
    }

    this.reset();

    try {
      await new CourseService(this.props.courseId).updateStudent(studentGithubId, { mentorGithuId });
      message.success('Success');
    } catch (e) {
      message.error(`${e}`);
    }
  };

  reset = () => {
    this.setState({ isModalOpened: false, studentGithubId: null });
  };

  handleStudentSelect = (githubId: string) => {
    this.setState({ studentGithubId: githubId ?? null });
  };

  render() {
    const { mentorGithuId, courseId } = this.props;
    const { isModalOpened } = this.state;

    return (
      <>
        <Button type="link" shape="circle" onClick={this.openModal}>
          Add Student
        </Button>
        <Modal
          title={
            <>
              Assign Student to <Text underline>{mentorGithuId}</Text>
            </>
          }
          visible={isModalOpened}
          onOk={this.addStudent}
          onCancel={this.reset}
        >
          <Row>
            <StudentSearch
              style={{ width: '100%' }}
              keyField="githubId"
              onChange={this.handleStudentSelect}
              courseId={courseId}
            />
          </Row>
        </Modal>
      </>
    );
  }
}

export default AssignStudentModal;

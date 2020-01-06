import { Button, Modal, Row, Typography, message } from 'antd';
import * as React from 'react';
import axios from 'axios';
import { StudentSearch } from 'components';

const { Text } = Typography;

type State = {
  isModalOpened: boolean;
  selectedStudent: number;
};

type Props = {
  mentorsGithub: string;
  mentorId: number;
  courseId: number;
};

class StudentsAddModal extends React.PureComponent<Props, State> {
  state: State = {
    isModalOpened: false,
    selectedStudent: 0,
  };

  openModal = () => {
    this.setState({ isModalOpened: true });
  };

  closeModal = () => {
    this.setState({ isModalOpened: false });
  };

  addStudent = async () => {
    const { mentorId } = this.props;
    const { selectedStudent } = this.state;

    this.reset();

    try {
      const url = `/api/student/${selectedStudent}`;
      const {
        data: { data: mentee },
      } = await axios.get(url);
      await axios.put(url, { ...mentee, mentorId });
      message.success('Success');
    } catch (e) {
      message.error(`${e}`);
    }
  };

  reset = () => {
    this.setState({ isModalOpened: false, selectedStudent: 0 });
  };

  handleStudentSelect = (id: number) => {
    this.setState({ selectedStudent: id ? id : 0 });
  };

  render() {
    const { mentorsGithub, courseId } = this.props;
    const { isModalOpened } = this.state;

    return (
      <>
        <Button type="link" shape="circle" onClick={this.openModal}>
          Add
        </Button>
        <Modal
          title={
            <>
              Assign Student to <Text underline>{mentorsGithub}</Text>
            </>
          }
          visible={isModalOpened}
          onOk={this.addStudent}
          onCancel={this.reset}
        >
          <Row>
            <StudentSearch onChange={this.handleStudentSelect} courseId={courseId} />
          </Row>
        </Modal>
      </>
    );
  }
}

export default StudentsAddModal;

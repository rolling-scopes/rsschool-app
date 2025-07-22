import { Modal, Typography } from 'antd';
import { StudentSearch } from 'components/StudentSearch';
import { useCallback, useState } from 'react';
import { CourseService } from 'services/course';
import { useMessage } from 'hooks';

const { Text } = Typography;

type Props = {
  mentorGithuId: string | null;
  courseId: number;
  open: boolean;
  onClose: () => void;
};

export function AssignStudentModal(props: Props) {
  const [studentGithubId, setStudentGithubId] = useState<string | null>(null);
  const { message } = useMessage();

  const addStudent = useCallback(async () => {
    if (!studentGithubId) {
      return;
    }
    try {
      await new CourseService(props.courseId).updateStudent(studentGithubId, { mentorGithuId: props.mentorGithuId });
      props.onClose();
      message.success('Student has been added to mentor');
    } catch (e) {
      message.error(`${e}`);
    }
  }, [props.mentorGithuId, studentGithubId]);

  return (
    <Modal
      title={
        <>
          <Text>Assign Student to</Text> <Text underline>{props.mentorGithuId}</Text>
        </>
      }
      open={props.open}
      onOk={addStudent}
      onCancel={props.onClose}
    >
      <StudentSearch
        style={{ width: '100%' }}
        keyField="githubId"
        onChange={setStudentGithubId}
        courseId={props.courseId}
      />
    </Modal>
  );
}

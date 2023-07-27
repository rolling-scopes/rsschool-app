import { Button, Form, Input } from 'antd';
import React from 'react';
import { CourseTaskSelect } from 'components/Forms';
import { ModalSubmitForm } from 'components/Forms/ModalSubmitForm';
import { urlPattern } from 'services/validators';
import { useSubmitTaskSolution } from 'modules/StudentDashboard/hooks/useSubmitTaskSolution';

interface TaskSolutionModalProps {
  courseId: number;
}

function SubmitTaskSolution({ courseId }: TaskSolutionModalProps) {
  const { state, closeModal, showModal, saveSolution, setSolutionUrl } = useSubmitTaskSolution(courseId);

  return (
    <>
      <Button onClick={showModal} type="primary">
        Submit Task
      </Button>
      <ModalSubmitForm
        title="Submit Task For Mentor Review"
        data={state}
        submitted={state?.submitted}
        submit={saveSolution}
        close={closeModal}
        errorText={state?.errorText}
        loading={state?.loading}
        successText="Your task has been successfully submitted for review"
      >
        <CourseTaskSelect groupBy="deadline" data={state?.data?.courseTasks ?? []} onChange={setSolutionUrl} />
        <Form.Item
          label="Add a solution link"
          name="url"
          required
          rules={[{ message: 'Please enter valid URL', pattern: urlPattern }]}
        >
          <Input />
        </Form.Item>
      </ModalSubmitForm>
    </>
  );
}

export default SubmitTaskSolution;

import { Coding, JupyterNotebook, SelfEducation } from 'modules/AutoTest/components';
import { CourseTaskDetailedDtoTypeEnum } from 'api';
import { Button, Col, Form, Row } from 'antd';
import { useCourseTaskSubmit } from 'modules/AutoTest/hooks';
import { CourseTaskVerifications } from 'modules/AutoTest/types';

type ExerciseProps = {
  githubId: string;
  courseId: number;
  courseTask: CourseTaskVerifications;
  finishTask: () => void;
};

function Exercise({ githubId, courseId, courseTask, finishTask }: ExerciseProps) {
  const { form, loading, submit, change } = useCourseTaskSubmit(courseId, courseTask, finishTask);

  const getExercise = () => {
    switch (courseTask?.type) {
      case CourseTaskDetailedDtoTypeEnum.Jstask:
      case CourseTaskDetailedDtoTypeEnum.Codewars:
      case CourseTaskDetailedDtoTypeEnum.Kotlintask:
      case CourseTaskDetailedDtoTypeEnum.Objctask:
        return <Coding courseTask={courseTask} githubId={githubId} />;
      case CourseTaskDetailedDtoTypeEnum.Ipynb:
        return <JupyterNotebook />;
      case CourseTaskDetailedDtoTypeEnum.Selfeducation:
        return <SelfEducation courseTask={courseTask} />;
      default:
        return null;
    }
  };

  return (
    <Row style={{ background: 'white', padding: '0 24px 24px' }} gutter={[0, 24]} justify="center">
      <Col>
        <Form form={form} layout="vertical" requiredMark={false} onFinish={submit} onChange={change}>
          {getExercise()}
          <Row justify="center">
            <Button loading={loading} type="primary" htmlType="submit">
              Submit
            </Button>
          </Row>
        </Form>
      </Col>
    </Row>
  );
}

export default Exercise;

import { Coding, JupyterNotebook, SelfEducation } from 'modules/AutoTest/components';
import { CourseTaskDetailedDtoTypeEnum } from 'api';
import { Button, Col, ColProps, Form, Row } from 'antd';
import { useCourseTaskSubmit } from 'modules/AutoTest/hooks';
import { CourseTaskVerifications } from 'modules/AutoTest/types';
import { useState } from 'react';

type ExerciseProps = {
  githubId: string;
  courseId: number;
  courseTask: CourseTaskVerifications;
  finishTask: () => void;
};

function responsiveColumns(type: CourseTaskDetailedDtoTypeEnum): ColProps | undefined {
  if (type !== CourseTaskDetailedDtoTypeEnum.Selfeducation) {
    return;
  }

  return {
    xs: 24,
    lg: 18,
    xl: 12,
  };
}

function Exercise({ githubId, courseId, courseTask, finishTask }: ExerciseProps) {
  const { form, loading, submit, change } = useCourseTaskSubmit(courseId, courseTask, finishTask);
  const [validationError, setValidationError] = useState(false);

  const onValuesChange = async () => {
    try {
      await form.validateFields();
      setValidationError(false);
    }
    catch {
      setValidationError(true);
    }
  }

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
      <Col {...responsiveColumns(courseTask.type)}>
        <Form form={form} layout="vertical" requiredMark={false} onFinish={submit} onChange={change} onValuesChange={onValuesChange}>
          {getExercise()}
          <Row justify="center">
            <Button loading={loading} type="primary" htmlType="submit" disabled={loading || validationError}>
              Submit
            </Button>
          </Row>
        </Form>
      </Col>
    </Row>
  );
}

export default Exercise;

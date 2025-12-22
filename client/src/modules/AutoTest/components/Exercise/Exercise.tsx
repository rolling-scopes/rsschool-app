import { Coding, JupyterNotebook, SelfEducation } from 'modules/AutoTest/components';
import { CourseTaskDetailedDtoTypeEnum } from '@client/api';
import { Col, ColProps, Form, Row, theme } from 'antd';
import { useCourseTaskSubmit } from 'modules/AutoTest/hooks';
import { CourseTaskVerifications } from 'modules/AutoTest/types';
import { useEffect, useState } from 'react';
import { TooltipedButton } from '@client/shared/components/TooltipedButton';

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

  const values = Form.useWatch([], form);

  useEffect(() => {
    if (!values || !Object.values(values).every(Boolean)) {
      return;
    }

    form.validateFields({ validateOnly: true }).then(
      () => {
        setValidationError(false);
      },
      () => {
        setValidationError(true);
      },
    );
  }, [values]);

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

  const { token } = theme.useToken();

  return (
    <Row style={{ background: token.colorBgContainer, padding: '0 24px 24px' }} gutter={[0, 24]} justify="center">
      <Col {...responsiveColumns(courseTask.type)}>
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={submit}
          onFinishFailed={() => setValidationError(true)}
          onChange={change}
        >
          {getExercise()}
          <Row justify="center">
            <TooltipedButton
              tooltipTitle="Form has validation errors! Check that all required fields are filled!"
              open={validationError}
              buttonText="Submit"
              loading={loading}
              disabled={loading}
            ></TooltipedButton>
          </Row>
        </Form>
      </Col>
    </Row>
  );
}

export default Exercise;

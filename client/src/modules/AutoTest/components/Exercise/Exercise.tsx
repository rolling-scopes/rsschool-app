import React from 'react';
import { Coding, JupyterNotebook, SelfEducation } from 'modules/AutoTest/components';
import { CourseTaskDetailedDto, CourseTaskDetailedDtoTypeEnum } from 'api';
import { Verification } from 'services/course';
import { Col, Form, Row } from 'antd';

type ExerciseProps = {
  githubId: string;
  courseTask: CourseTaskDetailedDto;
  verifications: Verification[];
};

function Exercise({ githubId, courseTask, verifications }: ExerciseProps) {
  const [form] = Form.useForm();

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
        return <SelfEducation courseTask={courseTask} verifications={verifications} />;
      default:
        return null;
    }
  };

  return (
    <Row style={{ background: 'white', padding: 24 }} gutter={[0, 24]} justify="center">
      <Col xs={24} lg={18} xl={12}>
        <Form form={form} layout="vertical" requiredMark={false}>
          {getExercise()}
        </Form>
      </Col>
    </Row>
  );
}

export default Exercise;
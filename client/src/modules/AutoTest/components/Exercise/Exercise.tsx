import React from 'react';
import { Coding, JupyterNotebook, SelfEducation } from 'modules/AutoTest/components';
import { CourseTaskDetailedDto, CourseTaskDetailedDtoTypeEnum } from 'api';
import { Verification } from 'services/course';

type ExerciseProps = {
  githubId: string;
  courseTask: CourseTaskDetailedDto;
  verifications: Verification[];
};

function Exercise({ githubId, courseTask, verifications }: ExerciseProps) {
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
}

export default Exercise;

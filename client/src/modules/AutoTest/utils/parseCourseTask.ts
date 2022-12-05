import { CourseTaskDetailedDto, CourseTaskDetailedDtoTypeEnum } from 'api';
import shuffle from 'lodash/shuffle';
import { SelfEducationQuestion } from 'services/course';

function getRandomQuestions(questions: SelfEducationQuestion[]) {
  const questionsWithIndex = questions.map((question, index) => ({ ...question, index }));
  return shuffle(questionsWithIndex);
}

export const parseCourseTask = (courseTask: CourseTaskDetailedDto) => {
  if (courseTask?.type === CourseTaskDetailedDtoTypeEnum.Selfeducation) {
    const pubAttrs = (courseTask.publicAttributes ?? {}) as Record<string, any>;
    return {
      ...courseTask,
      publicAttributes: {
        ...pubAttrs,
        questions: getRandomQuestions(pubAttrs.questions || []).slice(0, pubAttrs.numberOfQuestions),
      },
    };
  }
  return courseTask;
};

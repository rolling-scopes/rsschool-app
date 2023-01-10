import { Typography } from 'antd';
import { useMemo } from 'react';
import { SelfEducationQuestionWithIndex, SelfEducationQuestion } from 'services/course';
import shuffle from 'lodash/shuffle';
import { CourseTaskVerifications } from 'modules/AutoTest/types';
import { Question } from 'modules/AutoTest/components';

type SelfEducationProps = {
  courseTask: CourseTaskVerifications;
};

const { Paragraph } = Typography;

function getRandomQuestions(questions: SelfEducationQuestion[]): SelfEducationQuestionWithIndex[] {
  const questionsWithIndex = questions?.map((question, index) => ({ ...question, index }));
  return shuffle(questionsWithIndex);
}

function SelfEducation({ courseTask }: SelfEducationProps) {
  const { questions, numberOfQuestions } = courseTask.publicAttributes || {};

  const randomQuestions = useMemo(
    () => (getRandomQuestions(questions) || []).slice(0, numberOfQuestions),
    [questions?.length, numberOfQuestions],
  );

  return (
    <>
      <Paragraph>To submit the task answer the questions.</Paragraph>
      {randomQuestions?.map(({ index, ...question }, idx) => (
        <Question question={question} questionIndex={index} questionNumber={idx + 1} />
      ))}
    </>
  );
}

export default SelfEducation;

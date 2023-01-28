import { useEffect } from 'react';
import { Typography, Form } from 'antd';

import SubtaskCriteria from './criteria/SubtaskCriteria';
import TitleCriteria from './criteria/TitleCriteria';
import PenaltyCriteria from './criteria/PenaltyCriteria';
import { omit } from 'lodash';
import { CrossCheckCriteriaData } from 'services/course';

export enum TaskType {
  Title = 'title',
  Subtask = 'subtask',
  Penalty = 'penalty',
}

enum HasPenalty {
  Yes = 'yes',
  No = 'no',
}

export interface CountState {
  key: string;
  point: number;
}

export interface CommentState {
  key: string;
  textComment: string;
}

export interface CriteriaFormProps {
  countStar: CountState[];
  setCountStar: (newCount: CountState[]) => void;
  criteriaData: CrossCheckCriteriaData[];
  totalPoints?: number;
  penalty: CountState[];
  setPenalty: (newPenalty: CountState[]) => void;
  criteriaComment: CommentState[];
  setComment: (newComment: CommentState[]) => void;
}

export function CrossCheckCriteriaForm({
  countStar,
  setCountStar,
  criteriaData,
  totalPoints,
  penalty,
  setPenalty,
  criteriaComment,
  setComment,
}: CriteriaFormProps) {
  const form = Form.useFormInstance();
  const penaltyData: CrossCheckCriteriaData[] =
    criteriaData?.filter(item => item.type.toLowerCase() === TaskType.Penalty).map(item => omit(item, ['point'])) ?? [];

  useEffect(() => {
    form.setFieldValue('score', totalPoints);
  }, [totalPoints]);

  useEffect(() => {
    if (!criteriaData.length) return;

    const scorePoints = +countStar.reduce((acc, next) => acc + next.point, 0).toFixed(1);
    const penaltyPoints = penalty.reduce((acc, next) => acc + next.point, 0);

    const totalScore = scorePoints + penaltyPoints;
    const finalScore = totalScore > 0 ? totalScore : 0;

    form.setFieldValue('score', finalScore);
  }, [countStar, penalty]);

  function updateCountStar(event: number, max: number, key: string) {
    if (countStar.find(item => item.key === key)) {
      setCountStar([...countStar.filter(item => item.key !== key), { key, point: +((max / 5) * event).toFixed(1) }]);
    } else {
      setCountStar([...countStar, { key, point: +((max / 5) * event).toFixed(1) }]);
    }
  }

  function updatePenalty(max: number, key: string, value: string) {
    if (penalty.find(item => item.key === key)) {
      setPenalty([...penalty.filter(item => item.key !== key), { key, point: value === HasPenalty.Yes ? max : 0 }]);
    } else {
      setPenalty([...penalty, { key, point: value === HasPenalty.Yes ? max : 0 }]);
    }
  }

  function updateComment(value: string, key: string) {
    if (criteriaComment.find((item: { key: string }) => item.key === key)) {
      setComment([...criteriaComment.filter(item => item.key !== key), { key, textComment: value }]);
    } else {
      setComment([...criteriaComment, { key, textComment: value }]);
    }
  }

  return (
    <div style={{ margin: '0 auto', backgroundColor: 'white' }}>
      <div>
        {!!criteriaData?.length && (
          <>
            <Typography.Title level={4}>Criteria</Typography.Title>
            {criteriaData
              ?.filter(
                (item: CrossCheckCriteriaData) =>
                  item.type.toLowerCase() === TaskType.Title || item.type.toLowerCase() === TaskType.Subtask,
              )
              .map((item: CrossCheckCriteriaData) => {
                return item.type.toLowerCase() === TaskType.Title ? (
                  <TitleCriteria titleData={item} />
                ) : (
                  <SubtaskCriteria
                    criteriaComment={criteriaComment}
                    countStar={countStar}
                    updateCountStar={updateCountStar}
                    subtaskData={item}
                    updateComment={updateComment}
                  />
                );
              })}
          </>
        )}
        {!!penaltyData?.length && (
          <>
            <Typography.Title level={4}>Penalty</Typography.Title>
            {penaltyData?.map((task: CrossCheckCriteriaData) => (
              <PenaltyCriteria key={task.key} penaltyData={task} updatePenalty={updatePenalty} penaltyCount={penalty} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

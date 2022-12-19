import React, { useMemo } from 'react';
import { Typography, InputNumber } from 'antd';

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
  totalPoints: number;
  setTotalPoints: (newPoint: number) => void;
  penalty: CountState[];
  setPenalty: (newPenalty: CountState[]) => void;
  criteriaComment: CommentState[];
  setComment: (newComment: CommentState[]) => void;
  maxScoreForTask: number;
}

export function CrossCheckCriteriaForm({
  countStar,
  setCountStar,
  criteriaData,
  totalPoints,
  setTotalPoints,
  penalty,
  setPenalty,
  criteriaComment,
  setComment,
  maxScoreForTask,
}: CriteriaFormProps) {
  const penaltyData: CrossCheckCriteriaData[] =
    criteriaData?.filter(item => item.type.toLowerCase() === TaskType.Penalty).map(item => omit(item, ['point'])) ?? [];

  function calculateTotalPoints() {
    return useMemo(() => {
      const sumPoints = +countStar
        .map(item => item.point)
        .reduce((prev, next) => prev + next, 0)
        .toFixed(1);
      const sumPenalty = penalty.map(item => item.point).reduce((prev, next) => prev + next, 0);
      const finalPoints = sumPoints + sumPenalty;
      setTotalPoints(finalPoints > 0 ? finalPoints : 0);
      return finalPoints > 0 ? finalPoints : 0;
    }, [countStar, penalty]);
  }

  const calculationResultPoints = calculateTotalPoints();

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

  function changeFinalScore(value: number) {
    setTotalPoints(value > 0 ? value : 0);
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
              <PenaltyCriteria penaltyData={task} updatePenalty={updatePenalty} penaltyCount={penalty} />
            ))}
          </>
        )}
      </div>

      <div style={{ margin: '10px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Typography.Title level={4}>{`Score (Max ${maxScoreForTask} points) `}</Typography.Title>
        <InputNumber
          min={0}
          max={maxScoreForTask}
          value={totalPoints === calculationResultPoints ? calculationResultPoints : totalPoints}
          onChange={changeFinalScore}
          size={'middle'}
        />
      </div>
    </div>
  );
}

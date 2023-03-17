import { useEffect } from 'react';
import { Typography, InputNumber } from 'antd';
import { isEqual } from 'lodash';

import { SubtaskCriteria } from './criteria/SubtaskCriteria';
import { TitleCriteria } from './criteria/TitleCriteria';
import { PenaltyCriteria } from './criteria/PenaltyCriteria';
import { CrossCheckCriteriaData, SolutionReviewType } from 'services/course';

export enum TaskType {
  Title = 'title',
  Subtask = 'subtask',
  Penalty = 'penalty',
}
export interface CriteriaFormProps {
  maxScore: number | undefined;
  score: number;
  setScore: (value: number) => void;
  criteriaData: CrossCheckCriteriaData[];
  setCriteriaData: (newData: CrossCheckCriteriaData[]) => void;
  initialData: SolutionReviewType;
}

export function CrossCheckCriteriaForm({
  maxScore,
  score,
  setScore,
  criteriaData,
  setCriteriaData,
  initialData,
}: CriteriaFormProps) {
  const maxScoreValue = maxScore ?? 100;
  const maxScoreLabel = maxScoreValue ? ` (Max ${maxScoreValue} points)` : '';
  const penaltyData: CrossCheckCriteriaData[] =
    criteriaData?.filter(item => item.type.toLowerCase() === TaskType.Penalty) ?? [];

  useEffect(() => {
    const sortedInitialData = initialData?.criteria?.sort((a, b) => (a.key > b.key ? 1 : -1));
    const sortedCriteriaData = criteriaData.sort((a, b) => (a.key > b.key ? 1 : -1));

    if (!isEqual(sortedInitialData, sortedCriteriaData)) {
      const totalPoints = criteriaData.reduce((acc, criteria) => {
        return criteria.point ? acc + criteria.point : acc;
      }, 0);
      setScore(totalPoints > 0 ? totalPoints : 0);
    } else {
      setScore(initialData.score);
    }
  }, [criteriaData, initialData]);

  function updateCriteriaData(updatedEntry: CrossCheckCriteriaData) {
    const index = criteriaData.findIndex(item => item.key === updatedEntry.key);
    const updatedData = [...criteriaData];
    updatedData.splice(index, 1, updatedEntry);
    setCriteriaData(updatedData);
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
                  <TitleCriteria key={item.key} titleData={item} />
                ) : (
                  <SubtaskCriteria key={item.key} subtaskData={item} updateCriteriaData={updateCriteriaData} />
                );
              })}
          </>
        )}
        {!!penaltyData?.length && (
          <>
            <Typography.Title level={4}>Penalty</Typography.Title>
            {penaltyData?.map((item: CrossCheckCriteriaData) => (
              <PenaltyCriteria key={item.key} penaltyData={item} updateCriteriaData={updateCriteriaData} />
            ))}
          </>
        )}
      </div>
      <Typography.Title level={4}>{maxScoreLabel}</Typography.Title>
      <InputNumber
        value={score}
        onChange={num => setScore(num)}
        step={1}
        min={0}
        max={maxScoreValue}
        decimalSeparator={','}
      />
    </div>
  );
}

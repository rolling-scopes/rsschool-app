import React, { useEffect } from 'react';
import { Layout, Typography, InputNumber } from 'antd';

import SubtaskCriteria from './criteria/SubtaskCriteria';
import TitleCriteria from './criteria/TitleCriteria';
import PenaltyCriteria from './criteria/PenaltyCriteria';
import _ from 'lodash';

export interface CrossCheckCriteriaData {
  key: string;
  max?: number;
  text: string;
  type: string;
  point?: number;
  textComment?: string;
}

export interface ICountState {
  key: string;
  point: number;
}

export interface ICommentState {
  key: string;
  textComment: string;
}

export interface CriteriaFormProps {
  countStar: ICountState[];
  setCountStar: (newCount: ICountState[]) => void;
  criteriaData: CrossCheckCriteriaData[];
  totalPoints: number;
  setTotalPoints: (newPoint: number) => void;
  penalty: ICountState[];
  setPenalty: (newPenalty: ICountState[]) => void;
  criteriaComment: ICommentState[];
  setComment: (newComment: ICommentState[]) => void;
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
  const { Footer, Content } = Layout;

  let penaltyData: CrossCheckCriteriaData[] = criteriaData?.filter(item => item.type.toLowerCase() === 'penalty');

  if (penalty.length === 0) {
    penaltyData = penaltyData?.map(item => _.omit(item, ['point']));
  }

  useEffect(() => {
    const sumPoints = +countStar
      .map(item => item.point)
      .reduce((prev, next) => prev + next, 0)
      .toFixed(1);
    const sumPenalty = penalty.map(item => item.point).reduce((prev, next) => prev + next, 0);
    const finalPoints = sumPoints + sumPenalty;
    setTotalPoints(finalPoints > 0 ? finalPoints : 0);
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
      setPenalty([...penalty.filter(item => item.key !== key), { key, point: value ? max : 0 }]);
    } else {
      setPenalty([...penalty, { key, point: value ? max : 0 }]);
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
    <Layout style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: 'white' }}>
      <Content style={{ backgroundColor: 'white' }}>
        {!!criteriaData?.length && (
          <>
            <Typography.Title level={4}>Criteria</Typography.Title>
            {criteriaData?.map((task: CrossCheckCriteriaData) => {
              return task.type.toLowerCase() === 'title' ? (
                <TitleCriteria task={task} />
              ) : task.type.toLowerCase() === 'subtask' ? (
                <SubtaskCriteria
                  criteriaComment={criteriaComment}
                  countStar={countStar}
                  updateCountStar={updateCountStar}
                  task={task}
                  updateComment={updateComment}
                />
              ) : null;
            })}
          </>
        )}
        {!!penaltyData?.length && (
          <>
            <Typography.Title level={4}>Penalty</Typography.Title>
            {penaltyData?.map((task: CrossCheckCriteriaData) => (
              <PenaltyCriteria task={task} updatePenalty={updatePenalty} penalty={penalty} />
            ))}
          </>
        )}
      </Content>

      <Footer style={{ backgroundColor: 'white', padding: '10px 0 0 0' }}>
        <Typography.Text style={{ margin: '30px 0 5px 0' }}>{`Score (Max ${maxScoreForTask} points) `}</Typography.Text>
        <InputNumber
          min={0}
          max={maxScoreForTask}
          style={{ display: 'block', margin: '10px 0 10px 0', fontSize: '16px' }}
          value={+totalPoints}
          onChange={changeFinalScore}
          size={'middle'}
        />
      </Footer>
    </Layout>
  );
}

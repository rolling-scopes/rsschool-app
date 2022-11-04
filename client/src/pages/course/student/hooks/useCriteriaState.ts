import { useState } from 'react';

import { CrossCheckCriteriaData, ICommentState, ICountState } from 'components/CrossCheck/CrossCheckCriteriaForm';

export interface ICriteriaSetState {
  setCountStar: (newCount: ICountState[]) => void;
  setCriteriaData: (newCriteria: CrossCheckCriteriaData[]) => void;
  setScore: (newPoint: number) => void;
  setPenalty: (newPenalty: ICountState[]) => void;
  setComment: (newComment: ICommentState[]) => void;
}

interface ICriteriaState {
  countStar: ICountState[];
  criteriaData: CrossCheckCriteriaData[];
  score: number;
  penalty: ICountState[];
  criteriaComment: ICommentState[];
}

export function useCriteriaState(): [ICriteriaState, ICriteriaSetState] {
  const [countStar, setCountStar] = useState<ICountState[]>([]);
  const [penalty, setPenalty] = useState<ICountState[]>([]);
  const [criteriaData, setCriteriaData] = useState([] as CrossCheckCriteriaData[]);
  const [score, setScore] = useState(0);
  const [criteriaComment, setComment] = useState<ICommentState[]>([]);

  return [
    { countStar, penalty, criteriaData, score, criteriaComment },
    { setCountStar, setPenalty, setCriteriaData, setScore, setComment },
  ];
}

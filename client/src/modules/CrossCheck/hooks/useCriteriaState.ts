import { useState } from 'react';
import { CrossCheckCriteriaData } from 'services/course';

import { CommentState, CountState } from '../components/CrossCheckCriteriaForm';

interface CriteriaSetState {
  setCountStar: (newCount: CountState[]) => void;
  setCriteriaData: (newCriteria: CrossCheckCriteriaData[]) => void;
  setPenalty: (newPenalty: CountState[]) => void;
  setComment: (newComment: CommentState[]) => void;
}

interface CriteriaState {
  countStar: CountState[];
  criteriaData: CrossCheckCriteriaData[];
  penalty: CountState[];
  criteriaComment: CommentState[];
}

export function useCriteriaState(): [CriteriaState, CriteriaSetState] {
  const [countStar, setCountStar] = useState<CountState[]>([]);
  const [penalty, setPenalty] = useState<CountState[]>([]);
  const [criteriaData, setCriteriaData] = useState([] as CrossCheckCriteriaData[]);
  const [criteriaComment, setComment] = useState<CommentState[]>([]);

  return [
    { countStar, penalty, criteriaData, criteriaComment },
    { setCountStar, setPenalty, setCriteriaData, setComment },
  ];
}

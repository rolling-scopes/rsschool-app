import { useLocalStorage } from 'react-use';

enum LocalStorageKey {
  AreStudentContactsVisible = 'crossCheckAreStudentContactsVisible',
}

export interface SolutionReviewSettings {
  areStudentContactsVisible: boolean;
  setAreStudentContactsHidden: (value: boolean) => void;
}

export function useSolutionReviewSettings(): SolutionReviewSettings {
  const [areStudentContactsVisible = true, setAreStudentContactsHidden] = useLocalStorage<boolean>(
    LocalStorageKey.AreStudentContactsVisible,
  );

  return { areStudentContactsVisible, setAreStudentContactsHidden };
}

import { useLocalStorage } from 'react-use';
import { LocalStorageKey, SolutionReviewSettings } from '../constants';

export function useSolutionReviewSettings(): SolutionReviewSettings {
  const [areContactsVisible = true, setAreContactsVisible] = useLocalStorage<boolean>(
    LocalStorageKey.AreContactsVisible,
  );

  return { areContactsVisible, setAreContactsVisible };
}

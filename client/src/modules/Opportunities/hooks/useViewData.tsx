import { Contacts, CVFeedback, CVStudentStats, UserData } from 'common/models/cv';
import { useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import { OpportunitiesService } from '../services/opportunities';

type Props = {
  githubId: string;
};

const cvService = new OpportunitiesService();

export function useViewData({ githubId }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [contacts, setContacts] = useState<Contacts | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [courses, setCourses] = useState<CVStudentStats[] | null>(null);
  const [feedback, setFeedback] = useState<CVFeedback[] | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const cvData = await cvService.getFullResumeData(githubId);

    const {
      notes,
      name,
      selfIntroLink,
      startFrom,
      militaryService,
      avatarLink,
      desiredPosition,
      englishLevel,
      email,
      githubUsername,
      linkedin,
      locations,
      phone,
      skype,
      telegram,
      website,
      fullTime,
      feedback,
      courses,
    } = cvData;

    const userData = {
      notes,
      name,
      selfIntroLink,
      militaryService,
      avatarLink,
      desiredPosition,
      englishLevel,
      startFrom,
      fullTime,
    };

    const contactsList = {
      locations,
      email,
      github: githubUsername,
      linkedin,
      phone,
      skype,
      telegram,
      website,
    };

    setContacts(contactsList);
    setUserData(userData);
    setCourses(courses);
    setFeedback(feedback);
    setLoading(false);
  }, []);

  useAsync(fetchData, [githubId]);

  return { userData, loading, contacts, courses, feedback };
}

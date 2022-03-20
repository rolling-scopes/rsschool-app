import { FeedbackDto, GratitudeDto, ResumeCourseDto, ResumeDto } from 'api';
import { useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import { Contacts, UserData } from '../models';

type Props = {
  githubId?: string;
  initialData?: ResumeDto;
};

export function useViewData({ initialData: resume }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [contacts, setContacts] = useState<Contacts | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [courses, setCourses] = useState<ResumeCourseDto[]>([]);
  const [gratitudes, setGratitudes] = useState<GratitudeDto[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackDto[]>([]);
  const [uuid, setUuid] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data } = { data: resume };

    if (!data) {
      return;
    }

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
      courses,
      gratitudes,
      feedbacks,
      uuid,
    } = data;

    const userData = {
      notes,
      name,
      selfIntroLink,
      militaryService: militaryService as any,
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
    setGratitudes(gratitudes);
    setFeedbacks(feedbacks);
    setUuid(uuid);
    setLoading(false);
  }, []);

  useAsync(fetchData, []);

  return { userData, loading, contacts, courses, feedbacks, gratitudes, uuid };
}

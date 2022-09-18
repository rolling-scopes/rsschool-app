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
  const [expires, setExpires] = useState<number | null>(null);
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
      expires,
    } = data;

    const userData = {
      notes,
      name,
      selfIntroLink,
      militaryService: militaryService,
      locations,
      avatarLink,
      desiredPosition,
      englishLevel,
      startFrom,
      fullTime,
    };

    const contactsList = {
      email,
      githubUsername,
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
    setExpires(expires);
    setUuid(uuid);
    setLoading(false);
  }, []);

  useAsync(fetchData, []);

  return { userData, loading, contacts, courses, feedbacks, gratitudes, expires, uuid, setExpires };
}

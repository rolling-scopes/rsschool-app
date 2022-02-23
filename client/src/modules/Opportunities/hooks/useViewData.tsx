import { FeedbackDto, GratitudeDto, OpportunitiesApi, ResumeCourseDto } from 'api';
import { useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import { Contacts, UserData } from '../models';

type Props = {
  githubId: string;
};

const opportunitiesService = new OpportunitiesApi();

export function useViewData({ githubId }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [contacts, setContacts] = useState<Contacts | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [courses, setCourses] = useState<ResumeCourseDto[] | null>(null);
  const [gratitudes, setGratitudes] = useState<GratitudeDto[] | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackDto[] | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data } = await opportunitiesService.getResume(githubId);

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
    setLoading(false);
  }, []);

  useAsync(fetchData, [githubId]);

  return { userData, loading, contacts, courses, feedbacks, gratitudes };
}

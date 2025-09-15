import { Form, message } from 'antd';
import { useState, useCallback } from 'react';
import { useAsync } from 'react-use';
import {
  CourseDto,
  DisciplineDto,
  DisciplinesApi,
  MentorOptionsDtoPreferedStudentsLocationEnum,
  ProfileApi,
} from 'api';
import { Location } from '@common/models';
import { CdnService } from 'services/cdn';
import { Course } from 'services/models';
import { UserFull, UserService } from 'services/user';
import { GeneralSection, MentorshipSection, DoneSection } from 'modules/Registry/components';
import { ERROR_MESSAGES } from 'modules/Registry/constants';

export type FormData = ReturnType<typeof getInitialValues>;

const cdnService = new CdnService();
const userService = new UserService();
const disciplinesApi = new DisciplinesApi();
const profileApi = new ProfileApi();

export function useMentorData(courseAlias?: string | string[]) {
  const [form] = Form.useForm<FormData>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentStep, setCurrentSteps] = useState(0);
  const [loading, setLoading] = useState(false);
  const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);
  const [resume, setResume] = useState<FormData | undefined>();
  const [location, setLocation] = useState<Location | null>(null);

  useAsync(async () => {
    setLoading(true);
    const [profile, courses, disciplinesData] = await Promise.all([
      userService.getMyProfile(),
      userService.getCourses(),
      disciplinesApi.getDisciplines(),
    ]);
    const activeCourses = getActiveCourses(courses, courseAlias);
    const preselectedCourseIds = courseAlias ? activeCourses.map(({ id }: Course) => id) : [];

    setCourses(activeCourses);
    setDisciplines(disciplinesData.data);
    setLocation({
      countryName: profile.countryName,
      cityName: profile.cityName,
    });
    setResume(getInitialValues(profile, preselectedCourseIds));
    setLoading(false);
  }, []);

  const onPrevious = () => {
    setCurrentSteps(previousStep => previousStep - 1);
  };

  const handleSubmit = useCallback(
    async (model: FormData) => {
      const data = { ...resume, ...model };
      setResume(data);
      if (!currentStep) {
        setCurrentSteps(previousStep => previousStep + 1);
      } else {
        setLoading(true);

        const {
          technicalMentoring,
          preferedCourses,
          preferedStudentsLocation,
          maxStudentsLimit,
          languagesMentoring,
          location,
          firstName,
          lastName,
          primaryEmail,
          contactsEpamEmail,
          contactsTelegram,
          contactsSkype,
          contactsWhatsApp,
          contactsEmail,
          contactsNotes,
          contactsPhone,
          aboutMyself,
        } = data;

        const registryModel = {
          preferedCourses,
          maxStudentsLimit,
          preferedStudentsLocation,
          languagesMentoring,
          technicalMentoring,
        };

        const userModel = {
          firstName,
          lastName,
          primaryEmail,
          contactsEpamEmail,
          contactsTelegram,
          contactsSkype,
          contactsWhatsApp,
          contactsEmail,
          contactsNotes,
          contactsPhone,
          aboutMyself,
          cityName: location ? location.cityName : '',
          countryName: location ? location.countryName : '',
          languages: languagesMentoring,
        };

        const requests = [profileApi.updateUser(userModel), cdnService.registerMentor(registryModel)];

        try {
          await Promise.all(requests);
          setCurrentSteps(previousStep => previousStep + 1);
        } catch {
          message.error(ERROR_MESSAGES.tryLater);
        } finally {
          setLoading(false);
        }
      }
    },
    [resume, currentStep],
  );

  const steps = [
    { title: 'General', content: <GeneralSection location={location} setLocation={setLocation} /> },
    {
      title: 'Mentorship',
      content: <MentorshipSection courses={courses} disciplines={disciplines} onPrevious={onPrevious} />,
    },
    { title: 'Done', content: <DoneSection /> },
  ];

  return {
    handleSubmit,
    resume,
    loading,
    currentStep,
    steps,
    form,
  };
}

function getInitialValues(
  {
    countryName,
    cityName,
    languages,
    firstName,
    lastName,
    primaryEmail,
    contactsEpamEmail,
    contactsTelegram,
    contactsSkype,
    contactsWhatsApp,
    contactsEmail,
    contactsNotes,
    contactsPhone,
    aboutMyself,
  }: UserFull,
  preselectedCourseIds: number[],
) {
  const location =
    countryName &&
    cityName &&
    ({
      countryName,
      cityName,
    } as Location | null);
  return {
    firstName,
    lastName,
    primaryEmail,
    contactsEpamEmail,
    contactsTelegram,
    contactsSkype,
    contactsWhatsApp,
    contactsEmail,
    contactsNotes,
    contactsPhone,
    aboutMyself,
    location,
    preferedCourses: preselectedCourseIds,
    technicalMentoring: [],
    languagesMentoring: languages ?? [],
    preferedStudentsLocation:
      MentorOptionsDtoPreferedStudentsLocationEnum.Any as MentorOptionsDtoPreferedStudentsLocationEnum,
    maxStudentsLimit: 2,
    dataProcessing: false,
  };
}

function getActiveCourses(courses: CourseDto[], courseAlias?: string | string[]) {
  if (!courseAlias) {
    return courses
      .filter(course => (course.planned || !course.completed) && !course.inviteOnly && course.personalMentoring)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }

  if (Array.isArray(courseAlias)) {
    return courses.filter((course: Course) => courseAlias.includes(course.alias));
  }

  return courses.filter((course: Course) => course.alias === courseAlias);
}

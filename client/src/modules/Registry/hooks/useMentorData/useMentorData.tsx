import { message } from 'antd';
import { useEffect, useState, useCallback } from 'react';
import { useAsync } from 'react-use';
import {
  CourseDto,
  DisciplineDto,
  DisciplinesApi,
  MentorOptionsDtoPreferedStudentsLocationEnum,
  ProfileApi,
} from 'api';
import { Location } from 'common/models';
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

export function useMentorData(courseAlias?: string) {
  const [checkedList, setCheckedListCourse] = useState([] as number[]);
  const [courses, setCourses] = useState([] as Course[]);
  const [currentStep, setCurrentSteps] = useState(0);
  const [loading, setLoading] = useState(false);
  const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);
  const [initialData, setInitialData] = useState<Partial<UserFull> | null>(null);
  const [resume, setResume] = useState<FormData | undefined>();
  const [location, setLocation] = useState(null as Location | null);

  useAsync(async () => {
    setLoading(true);
    const [profile, courses, disciplinesData] = await Promise.all([
      userService.getMyProfile(),
      cdnService.getCourses(),
      disciplinesApi.getDisciplines(),
    ]);
    const activeCourses = getActiveCourses(courses, courseAlias);
    const checkedListCourse = courseAlias
      ? courses.filter((course: Course) => course.alias === courseAlias).map(({ id }: Course) => id)
      : [];

    setInitialData(profile);
    setCourses(activeCourses);
    setCheckedListCourse(checkedListCourse);
    setDisciplines(disciplinesData.data);

    if (initialData) {
      setResume(getInitialValues(initialData, checkedList));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    setLocation({
      countryName: initialData?.countryName,
      cityName: initialData?.cityName,
    } as Location);

    if (initialData) {
      setResume(getInitialValues(initialData, checkedList));
    }
  }, [initialData, checkedList]);

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
        } = data;

        const registryModel = {
          preferedCourses,
          maxStudentsLimit,
          preferedStudentsLocation,
          languagesMentoring,
          technicalMentoring,
        };

        const userModel = {
          cityName: location ? location.cityName : '',
          countryName: location ? location.countryName : '',
          firstName: data.firstName,
          lastName: data.lastName,
          primaryEmail: data.primaryEmail,
          contactsEpamEmail: data.contactsEpamEmail,

          contactsTelegram: data.contactsTelegram,
          contactsSkype: data.contactsSkype,
          contactsWhatsApp: data.contactsWhatsApp,
          contactsEmail: data.contactsEmail,
          contactsNotes: data.contactsNotes,
          contactsPhone: data.contactsPhone,
          aboutMyself: data.aboutMyself,
          languages: languagesMentoring,
        };

        const requests = [profileApi.updateUser(userModel), cdnService.registerMentor(registryModel)];

        try {
          await Promise.all(requests);
          setCurrentSteps(previousStep => previousStep + 1);
        } catch (e) {
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
      content: (
        <MentorshipSection
          checkedList={checkedList}
          courses={courses}
          disciplines={disciplines}
          onPrevious={onPrevious}
        />
      ),
    },
    { title: 'Done', content: <DoneSection /> },
  ];

  return {
    handleSubmit,
    resume,
    loading,
    currentStep,
    steps,
  };
}

function getInitialValues(
  { countryName, cityName, languages, ...initialData }: Partial<UserFull>,
  checkedList: number[],
) {
  const location =
    countryName &&
    cityName &&
    ({
      countryName,
      cityName,
    } as Location | null);
  return {
    ...initialData,
    location,
    preferedCourses: checkedList,
    englishMentoring: false,
    technicalMentoring: [],
    languagesMentoring: languages ?? [],
    preferedStudentsLocation:
      MentorOptionsDtoPreferedStudentsLocationEnum.Any as MentorOptionsDtoPreferedStudentsLocationEnum,
    maxStudentsLimit: 2,
  };
}

function getActiveCourses(courses: CourseDto[], courseAlias?: string) {
  return courseAlias
    ? courses.filter((course: Course) => course.alias === courseAlias)
    : courses
        .filter(course => (course.planned || !course.completed) && !course.inviteOnly && course.personalMentoring)
        .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

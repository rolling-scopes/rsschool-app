import { Form, message } from 'antd';
import { CourseDto } from 'api';
import axios from 'axios';
import { Location } from 'common/models';
import { RegistrationPageLayout } from 'components/RegistartionPageLayout';
import { Session } from 'components/withSession';
import {
  MentorRegistrationGeneral,
  MentorRegistrationMentorship,
  MentorStepAbout,
  MentorStepRegistration,
  MentorStepSuccess,
} from 'modules/Registry/components';
import { useCallback, useEffect, useState } from 'react';
import { useAsync, useUpdate } from 'react-use';
import { CdnService } from 'services/cdn';
import type { Course } from 'services/models';
import { UserFull, UserService } from 'services/user';

export type Props = {
  courses?: Course[];
  session: Session;
};

const cdnService = new CdnService();

export function MentorRegistry(props: Props & { courseAlias?: string }) {
  const [form] = Form.useForm();
  const [isAvailableContact, setIsAvailableContact] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [location, setLocation] = useState(null as Location | null);
  const [courses, setCourses] = useState([] as Course[]);
  const [checkedList, setCheckedListCourse] = useState([] as number[]);
  const [initialData, setInitialData] = useState(null as Partial<UserFull> | null);
  const [startPage, setStartPage] = useState(true);
  const [currentStep, setCurrentSteps] = useState(0);
  const [resume, setResume] = useState(null as any | null);

  const update = useUpdate();

  useAsync(async () => {
    setLoading(true);
    const [profile, courses] = await Promise.all([new UserService().getMyProfile(), cdnService.getCourses()]);
    const activeCourses = getActiveCourses(courses, props.courseAlias);
    const checkedListCourse = props.courseAlias
      ? courses.filter((course: Course) => course.alias === props.courseAlias).map(({ id }: Course) => id)
      : [];

    setInitialData(profile);
    setCourses(activeCourses);

    setCheckedListCourse(checkedListCourse);
    if (initialData) {
      setResume(getInitialValues(initialData, checkedList));
    }

    setLoading(false);

    setIsAvailableContact(!!profile.contactsSkype.trim() || !!profile.contactsTelegram.trim());
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

  const handleSubmit = useCallback(
    async (model: any) => {
      const data = { ...resume, ...model };
      setResume(data);
      if (!currentStep) {
        setCurrentSteps(currentStep + 1);
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
          cityName: location.cityName,
          countryName: location.countryName,
          firstName: resume.firstName,
          lastName: resume.lastName,

          primaryEmail: resume.primaryEmail,
          contactsTelegram: resume.contactsTelegram,
          contactsSkype: resume.contactsSkype,
          contactsEpamEmail: resume.contactsEpamEmail,
          contactsNotes: resume.contactsNotes,
          aboutMyself: resume.aboutMyself,
        };

        const requests = [axios.post<any>('/api/profile/me', userModel), cdnService.registerMentor(registryModel)];

        try {
          await Promise.all(requests);
          setSubmitted(true);
        } catch (e) {
          message.error('An error occured. Please try later');
        } finally {
          setLoading(false);
        }
      }
    },
    [resume, currentStep],
  );

  const prev = () => {
    if (!currentStep) {
      setStartPage(true);
    } else {
      setCurrentSteps(currentStep - 1);
    }
  };

  const getContentGeneral = () => (
    <MentorRegistrationGeneral
      courses={courses}
      checkedList={checkedList}
      location={location}
      isAvailableContact={isAvailableContact}
      setIsAvailableContact={setIsAvailableContact}
      setLocation={setLocation}
    />
  );

  const getContentMentorship = () => <MentorRegistrationMentorship checkedList={checkedList} />;

  const steps = [
    { title: 'General', content: getContentGeneral },
    { title: 'Mentorship', content: getContentMentorship },
  ];

  let content: React.ReactNode = null;
  if (loading) {
    content = null;
  } else if (submitted) {
    content = <MentorStepSuccess />;
  } else if (resume) {
    content = (
      <Form
        layout="vertical"
        form={form}
        initialValues={resume}
        onChange={update}
        onFinish={handleSubmit}
        onFinishFailed={({ errorFields: [errorField] }) => form.scrollToField(errorField.name)}
      >
        {startPage ? (
          <MentorStepAbout onNext={() => setStartPage(false)} />
        ) : (
          <MentorStepRegistration
            currentStep={currentStep}
            steps={steps}
            onPrev={prev}
            onStart={() => setStartPage(true)}
          />
        )}
      </Form>
    );
  }

  return (
    <RegistrationPageLayout loading={loading} githubId={props.session.githubId}>
      {content}
    </RegistrationPageLayout>
  );
}

function getActiveCourses(courses: CourseDto[], courseAlias?: string) {
  return courseAlias
    ? courses.filter((course: Course) => course.alias === courseAlias)
    : courses
        .filter(course => (course.planned || !course.completed) && !course.inviteOnly && course.personalMentoring)
        .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function getInitialValues({ countryName, cityName, ...initialData }: Partial<UserFull>, checkedList: number[]) {
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
  };
}

import { useAsync } from 'react-use';
import { Course } from 'services/models';
import { UserFull, UserService } from 'services/user';
import { StudentStats } from 'common/models';
import { useCallback, useEffect, useState } from 'react';
import { CdnService } from 'services/cdn';
import { GeneralSection, DoneSection } from 'modules/Registry/components';
import { Location } from 'common/models';
import { Form, message, Modal, Typography } from 'antd';
import { useRouter } from 'next/router';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { DisciplinesApi, ProfileApi } from 'api';
import { TYPES } from 'configs/registry';
import { ERROR_MESSAGES } from 'modules/Registry/constants';

const { Title, Text } = Typography;

type StudentFormData = ReturnType<typeof getInitialValues>;

type IdName = {
  id: number;
  name: string;
};

const cdnService = new CdnService();
const profileApi = new ProfileApi();
const userService = new UserService();
const disciplinesApi = new DisciplinesApi();

export function useStudentData(githubId: string, courseAlias: string | undefined) {
  const router = useRouter();
  const [form] = Form.useForm<StudentFormData>();
  const [registered, setRegistered] = useState<boolean | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [location, setLocation] = useState(null as Location | null);
  const [loading, setLoading] = useState(false);
  const [missingDisciplines, setMissingDisciplines] = useState('');

  const { value: student, loading: dataLoading } = useAsync(async () => {
    const [profile, profileInfo, courses] = await Promise.all([
      userService.getMyProfile(),
      userService.getProfileInfo(githubId),
      cdnService.getCourses(),
    ]);

    const registeredForCourses = enrolledOtherCourses(profileInfo?.studentStats, courses);

    if (courseAlias) {
      const currentCourse = courses.find(course => course.alias === courseAlias);
      const value = registeredForCourses.some(({ id }) => id === currentCourse?.id);

      if (currentCourse) {
        const disciplineIds = currentCourse.certificateDisciplines;
        const { data } = (await disciplinesApi.getDisciplinesByIds({ ids: disciplineIds })) as { data: IdName[] };

        const certifiedStudentCourseIds =
          profileInfo.studentStats
            ?.map(course => ({
              courseId: course.courseId,
              certificate: course.certificateId,
            }))
            .filter(item => item.certificate)
            .map(item => item.courseId) || [];

        if (disciplineIds.includes(0)) {
          if (!certifiedStudentCourseIds.length) {
            setMissingDisciplines('any');
          }
        } else {
          const studentCertifiedDisciplineNames = [
            ...new Set(
              courses
                .filter(course => certifiedStudentCourseIds.includes(course.id))
                .map(course => course.discipline?.name)
                .filter(Boolean),
            ),
          ];

          const requiredDisciplineNames = data.map(discipline => discipline.name);
          const hasAllRequiredDisciplines = requiredDisciplineNames.every(name =>
            studentCertifiedDisciplineNames.includes(name),
          );

          if (!hasAllRequiredDisciplines) {
            const missingDisciplines = requiredDisciplineNames
              .filter(name => !studentCertifiedDisciplineNames.includes(name))
              .join(', ');

            setMissingDisciplines(missingDisciplines);
          }
        }
      }

      if (value) {
        setRegistered(value);
        return;
      }
    }

    setRegistered(false);

    const activeCourses = courseAlias
      ? courses.filter(isCourseOpenForRegistryWithAlias(courseAlias))
      : courses.filter(isCourseOpenForRegistry(registeredForCourses)).sort(sortByStartDate);

    form.setFieldsValue(getInitialValues(profile, activeCourses));

    return {
      profile,
      registeredForCourses,
      courses: activeCourses,
    } as const;
  }, [githubId, courseAlias]);

  const handleSubmit = useCallback(
    async (values: StudentFormData) => {
      if (loading || dataLoading) {
        return;
      }

      const { courseId, location, primaryEmail, contactsEpamEmail, firstName, lastName, languagesMentoring } = values;
      const registryModel = { type: TYPES.STUDENT, courseId };
      const userModel = {
        cityName: location?.cityName ?? '',
        countryName: location?.countryName ?? '',
        primaryEmail,
        contactsEpamEmail,
        firstName,
        lastName,
        languages: languagesMentoring,
      };

      if (student?.registeredForCourses.length) {
        Modal.confirm({
          icon: <ExclamationCircleOutlined size={16} style={{ color: '#1890FF' }} />,
          title: (
            <Title level={5} style={{ verticalAlign: 'middle' }}>
              Course registration warning
            </Title>
          ),
          content: (
            <>
              <Text>You are already registered for the following courses:</Text>
              <ul>
                {student.registeredForCourses.map(({ name }) => (
                  <li key={name}>
                    <Text>{name}</Text>
                  </li>
                ))}
              </ul>
              <Text style={{ fontWeight: 700 }}>
                NOTE: We do not recommend studying at several courses at the same time.
              </Text>
            </>
          ),
          centered: true,
          onOk: async () => {
            await confirmRegistration();
          },
          okText: 'Register',
          maskClosable: true,
          autoFocusButton: 'cancel',
        });
      } else {
        await confirmRegistration();
      }

      async function confirmRegistration() {
        const requests = [profileApi.updateUser(userModel), cdnService.registerStudent(registryModel)];
        setLoading(true);

        try {
          await Promise.all(requests);
          setCurrentStep(previousStep => previousStep + 1);
        } catch {
          message.error(ERROR_MESSAGES.tryLater);
        } finally {
          setLoading(false);
        }
      }
    },
    [loading, dataLoading, student?.registeredForCourses],
  );

  function getCourseName() {
    const course = student?.courses.find(course => course.id === form.getFieldValue('courseId'));
    return course?.fullName;
  }

  const steps = [
    {
      title: 'General',
      content: <GeneralSection location={location} setLocation={setLocation} courses={student?.courses} />,
    },
    { title: 'Done', content: <DoneSection courseName={getCourseName()} /> },
  ];

  useEffect(() => {
    if (registered) {
      message.success('You are already registered to the course. Redirecting to Home page in 5 seconds...');
      setTimeout(() => router.push('/'), 5000);
    }
  }, [registered, router]);

  useEffect(() => {
    setLocation(
      student?.profile ? { countryName: student.profile.countryName, cityName: student.profile.cityName } : null,
    );
  }, [student?.profile]);

  return {
    courses: student?.courses ?? [],
    loading: dataLoading || loading,
    registered,
    steps,
    currentStep,
    form,
    handleSubmit,
    missingDisciplines,
  } as const;
}

function getInitialValues(
  { countryName, cityName, languages, firstName, lastName, primaryEmail, contactsEpamEmail }: Partial<UserFull> = {},
  courses: Course[] = [],
) {
  const location: Location | null = countryName && cityName ? { countryName, cityName } : null;
  return {
    firstName,
    lastName,
    primaryEmail,
    contactsEpamEmail,
    languagesMentoring: languages,
    courseId: courses[0]?.id,
    location,
  } as const;
}

function enrolledOtherCourses(studentStats: StudentStats[] | undefined, courses: Course[]) {
  return (
    studentStats?.reduce((acc, { isExpelled, isCourseCompleted, courseId }) => {
      const course = courses?.find(el => el.id === courseId);
      if (!isExpelled && !isCourseCompleted && course?.completed === false) {
        acc.push({ id: courseId, name: `${course.name} (${getStatus(course)})` });
      }
      return acc;
    }, [] as IdName[]) ?? []
  );
}

function isCourseOpenForRegistry(registeredCourses: IdName[]) {
  return (course: Course) => {
    // invite only courses do not open for public registration
    if (course.inviteOnly) {
      return false;
    }
    return isCourseAvailableForRegistration(course, registeredCourses);
  };
}

function isCourseOpenForRegistryWithAlias(courseAlias?: string) {
  return (course: Course) => courseAlias === course.alias && isCourseAvailableForRegistration(course, []);
}

function isCourseAvailableForRegistration(course: Course, registeredCourses: IdName[]) {
  if (course.completed || registeredCourses.some(({ id }) => id === course.id)) {
    return false;
  }

  const isRegistrationActive = new Date(course.registrationEndDate || 0).getTime() > Date.now();
  if (isRegistrationActive) {
    return true;
  }

  if (course.planned) {
    return true;
  }

  return false;
}

function sortByStartDate(a: Course, b: Course) {
  return a.startDate.localeCompare(b.startDate);
}

function getStatus(course: Course) {
  return course.planned ? 'Planned' : 'Active';
}

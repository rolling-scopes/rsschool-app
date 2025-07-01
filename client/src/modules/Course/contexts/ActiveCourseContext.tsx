import { ProfileCourseDto } from 'api';
import { LoadingScreen } from 'components/LoadingScreen';
import { useRouter } from 'next/router';
import React, { useCallback, useContext, useState } from 'react';
import { useLocalStorage } from 'react-use';
import { UserService } from 'services/user';
import { WelcomeCard } from 'components/WelcomeCard';
import { Alert, Col, notification, Row } from 'antd';
import useRequest from 'ahooks/lib/useRequest';

type ActiveCourseContextType = {
  course: ProfileCourseDto;
  courses: ProfileCourseDto[];
  setCourse: (course: ProfileCourseDto) => void;
};

const ActiveCourseContext = React.createContext<ActiveCourseContextType>({
  course: {} as ProfileCourseDto,
  courses: [],
  setCourse: () => {},
});

export const useActiveCourseContext = () => {
  return useContext(ActiveCourseContext);
};

type Props = React.PropsWithChildren;

export const ActiveCourseProvider = ({ children }: Props) => {
  const router = useRouter();

  // course alias
  const alias = router.query.course;

  const [storageCourseId, setStorageCourseId] = useLocalStorage<string>('activeCourseId');
  const [activeCourse, setActiveCourse] = useState<ProfileCourseDto>();

  const { data, loading } = useRequest(() => resolveCourse(alias, storageCourseId), {
    ready: router.isReady,
    onSuccess: ([course]) => setCourse(course),
    onError: () => {
      const { pathname, search } = document.location;
      const redirectUrl = encodeURIComponent(`${pathname}${search}`);
      router.push('/login', { pathname: '/login', query: { url: redirectUrl } });
      notification.error({
        message: 'Error occurred during login',
        description: 'Please try again later or contact course manager',
      });
    },
    // cache course info for 15 minutes
    cacheKey: `course-${String(alias)}`,
    staleTime: 1000 * 60 * 15,
  });

  const setCourse = useCallback((course: ProfileCourseDto | null) => {
    if (course) {
      setActiveCourse(course);
      setStorageCourseId(course.id.toString());
    }
  }, []);

  if (alias && activeCourse && activeCourse.alias !== alias) {
    return (
      <Row justify="center">
        <Col md={12} xs={18} style={{ marginTop: '60px' }}>
          <Alert
            message="No Access"
            description="Probably you do not participate in the course. Please register or choose another course."
            type="error"
          />
        </Col>
      </Row>
    );
  }

  if (data && data[0] === null) {
    return <WelcomeCard />;
  }

  if (data && activeCourse) {
    return (
      <ActiveCourseContext.Provider value={{ course: activeCourse, courses: data[1], setCourse }}>
        {children}
      </ActiveCourseContext.Provider>
    );
  }

  return <LoadingScreen show={loading} />;
};

async function resolveCourse(
  alias: string | string[] | undefined,
  storageCourseId?: string,
): Promise<[ProfileCourseDto | null, ProfileCourseDto[]]> {
  const courses = await new UserService().getCourses();

  const course =
    courses.find(course => course.alias === alias) ??
    courses.find(course => String(course.id) === String(storageCourseId)) ??
    courses[0] ??
    null;
  return [course, courses] as const;
}

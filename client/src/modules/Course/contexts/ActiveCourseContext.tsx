import { CoursesApi, ProfileCourseDto } from 'api';
import { LoadingScreen } from 'components/LoadingScreen';
import { useRouter } from 'next/router';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useLocalStorage } from 'react-use';
import { UserService } from 'services/user';
import { WelcomeCard } from 'components/WelcomeCard';
import { Alert, Col, notification, Row } from 'antd';
import useRequest from 'ahooks/lib/useRequest';
import { AxiosError } from 'axios';
import { MentorRegistryService } from '@client/services/mentorRegistry';

type ActiveCourseContextType = {
  course: ProfileCourseDto;
  courses: ProfileCourseDto[];
  setCourse: (course: ProfileCourseDto) => void;
  refresh: () => void;
};

const ActiveCourseContext = React.createContext<ActiveCourseContextType>({
  course: {} as ProfileCourseDto,
  courses: [],
  setCourse: () => {},
  refresh: () => {},
});

export const useActiveCourseContext = () => {
  return useContext(ActiveCourseContext);
};

type Props = React.PropsWithChildren<{
  publicRoutes: string[];
  mentorConfirmRoute: string;
}>;

export const ActiveCourseProvider = ({ children, publicRoutes, mentorConfirmRoute }: Props) => {
  const router = useRouter();

  // course alias
  const alias = router.query.course;
  const isPublicRoute = publicRoutes?.includes(router.pathname);
  const isMentorConfirmRoute = router.pathname === mentorConfirmRoute;

  const [storageCourseId, setStorageCourseId] = useLocalStorage<string>('activeCourseId');
  const [activeCourse, setActiveCourse] = useState<ProfileCourseDto>();
  const [isMentorInvited, setIsMentorInvited] = useState(false);

  const { data, loading, refresh } = useRequest(() => resolveCourse(alias, storageCourseId), {
    ready: router.isReady && !isPublicRoute,
    onSuccess: ([course]) => setCourse(course),
    onError: error => {
      const { pathname, search } = document.location;
      const redirectUrl = encodeURIComponent(`${pathname}${search}`);
      router.push('/login', { pathname: '/login', query: { url: redirectUrl } });

      if ((error as AxiosError).status !== 401) {
        notification.error({
          message: 'Error occurred during login',
          description: 'Please try again later or contact course manager',
        });
      }
    },
  });

  const { loading: mentorLoading } = useRequest(
    async () => {
      const mentor = await new MentorRegistryService().getMentor();
      if (!mentor) {
        return false;
      }
      const courseToConfirm = await new CoursesApi().getCourseByAlias(alias as string);
      const isInvited = mentor?.preselectedCourses?.includes(courseToConfirm?.data.id) ?? false;
      return isInvited;
    },
    {
      ready: router.isReady && isMentorConfirmRoute && typeof alias === 'string' && Boolean(alias),
      onSuccess: isInvited => setIsMentorInvited(isInvited),
      onError: () => {
        notification.error({
          message: 'Mentor check failed',
          description: 'Please try again later or contact course manager',
        });
      },
    },
  );

  const setCourse = useCallback((course: ProfileCourseDto | null) => {
    if (course) {
      setActiveCourse(course);
      setStorageCourseId(course.id.toString());
    }
  }, []);

  const value = useMemo(
    () => (data && activeCourse ? { course: activeCourse, courses: data?.[1] ?? [], setCourse, refresh } : undefined),
    [activeCourse, data, setCourse, refresh],
  );

  if (isPublicRoute && router.isReady) {
    return <>{children}</>;
  }

  const noAccess = alias && activeCourse && activeCourse.alias !== alias && !isMentorInvited && !mentorLoading;

  if (noAccess) {
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

  if (value) {
    return <ActiveCourseContext.Provider value={value}>{children}</ActiveCourseContext.Provider>;
  }

  return <LoadingScreen show={loading || mentorLoading} />;
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

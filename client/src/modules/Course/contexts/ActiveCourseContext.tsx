import { ProfileCourseDto } from 'api';
import { LoadingScreen } from 'components/LoadingScreen';
import { useRouter } from 'next/router';
import React, { useContext, useEffect } from 'react';
import { useAsync, useLocalStorage } from 'react-use';
import { UserService } from 'services/user';
import { WelcomeCard } from 'components/WelcomeCard';
import { Alert, Col, Row } from 'antd';

const ActiveCourseContext = React.createContext<{ course: ProfileCourseDto; courses: ProfileCourseDto[] }>(
  {} as { course: ProfileCourseDto; courses: ProfileCourseDto[] },
);

export const useActiveCourseContext = () => {
  return useContext(ActiveCourseContext);
};

type Props = React.PropsWithChildren;

let coursesCache: ProfileCourseDto[] | undefined;

export const ActiveCourseProvider = ({ children }: Props) => {
  const router = useRouter();
  const alias = router.query.course;
  const [storageCourseId] = useLocalStorage('activeCourseId');

  const {
    value: course,
    error,
    loading,
  } = useAsync(async () => {
    if (!coursesCache) {
      coursesCache = await new UserService().getCourses();
    }

    const course =
      coursesCache.find(course => course.alias === alias) ??
      coursesCache.find(course => course.id === storageCourseId) ??
      coursesCache[0];
    return course;
  }, []);

  useEffect(() => {
    if (!error) {
      return;
    }
    const { pathname, search } = document.location;
    const redirectUrl = encodeURIComponent(`${pathname}${search}`);
    router.push('/login', { pathname: '/login', query: { url: redirectUrl } });
  }, [error]);

  if (!loading && !course && !coursesCache?.length) {
    return <WelcomeCard />;
  }

  if (alias && course && course.alias !== alias) {
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

  if (course && coursesCache) {
    return (
      <ActiveCourseContext.Provider value={{ course, courses: coursesCache }}>{children}</ActiveCourseContext.Provider>
    );
  }

  return <LoadingScreen show={loading} />;
};

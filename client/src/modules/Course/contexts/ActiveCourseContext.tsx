import { ProfileCourseDto } from 'api';
import { LoadingScreen } from 'components/LoadingScreen';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { useAsync, useLocalStorage } from 'react-use';
import { UserService } from 'services/user';
import { WelcomeCard } from 'components/WelcomeCard';
import { Alert, Col, Row } from 'antd';

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

let coursesCache: ProfileCourseDto[] | undefined;

export const ActiveCourseProvider = ({ children }: Props) => {
  const router = useRouter();
  const alias = router.query.course;
  const [storageCourseId] = useLocalStorage('activeCourseId');
  const [activeCourse, setActiveCourse] = useState<ProfileCourseDto>();
  const [loading, setLoading] = useState(true);

  const { error } = useAsync(async () => {
    if (router.isReady) {
      if (!coursesCache) {
        coursesCache = await new UserService().getCourses();
      }

      const course =
        coursesCache.find(course => course.alias === alias) ??
        coursesCache.find(course => course.id === storageCourseId) ??
        coursesCache[0];

      setCourse(course);
      setLoading(false);
    }
  }, [router.isReady]);

  const setCourse = (course: ProfileCourseDto) => {
    setActiveCourse(course);
    localStorage.setItem('activeCourseId', course.id.toString());
  };

  useEffect(() => {
    if (!error) {
      return;
    }
    const { pathname, search } = document.location;
    const redirectUrl = encodeURIComponent(`${pathname}${search}`);
    router.push('/login', { pathname: '/login', query: { url: redirectUrl } });
  }, [error]);

  if (!loading && !activeCourse && !coursesCache?.length) {
    return <WelcomeCard />;
  }

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

  if (activeCourse && coursesCache) {
    return (
      <ActiveCourseContext.Provider value={{ course: activeCourse, courses: coursesCache, setCourse }}>
        {children}
      </ActiveCourseContext.Provider>
    );
  }

  return <LoadingScreen show={loading} />;
};

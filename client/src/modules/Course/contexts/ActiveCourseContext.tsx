import { ProfileCourseDto } from 'api';
import { LoadingScreen } from 'components/LoadingScreen';
import Router from 'next/router';
import React, { useContext, useEffect } from 'react';
import { useAsync, useLocalStorage } from 'react-use';
import { UserService } from 'services/user';
import { WelcomeCard } from 'components/WelcomeCard';

const ActiveCourseContext = React.createContext<{ course: ProfileCourseDto; courses: ProfileCourseDto[] }>(
  {} as { course: ProfileCourseDto; courses: ProfileCourseDto[] },
);

export const useActiveCourseContext = () => {
  return useContext(ActiveCourseContext);
};

type Props = React.PropsWithChildren;

let coursesCache: ProfileCourseDto[] | undefined;

export const ActiveCourseProvider = ({ children }: Props) => {
  const alias = Router.query.course;
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
    Router.push('/login', { pathname: '/login', query: { url: redirectUrl } });
  }, [error]);

  if (course && coursesCache) {
    return (
      <ActiveCourseContext.Provider value={{ course, courses: coursesCache }}>{children}</ActiveCourseContext.Provider>
    );
  }

  if (!loading && !course && !coursesCache) {
    return <WelcomeCard />;
  }

  return <LoadingScreen show={loading} />;
};

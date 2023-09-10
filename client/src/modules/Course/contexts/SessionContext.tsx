import { Button, Result } from 'antd';
import type { ProfileCourseDto } from 'api';
import axios from 'axios';
import { LoadingScreen } from 'components/LoadingScreen';
import type { Session } from 'components/withSession';
import { CourseRole } from 'services/models';
import Router from 'next/router';
import React, { useEffect } from 'react';
import { useAsync } from 'react-use';
import { useActiveCourseContext } from './ActiveCourseContext';

export const SessionContext = React.createContext<Session>({} as Session);

let sessionCache: Session | undefined;

type Props = React.PropsWithChildren<{
  allowedRoles?: CourseRole[];
  course?: ProfileCourseDto;
  adminOnly?: boolean;
}>;

export function SessionProvider(props: Props) {
  const { allowedRoles } = props;
  const activeCourse = useActiveCourseContext().course;
  const course = props.course ?? activeCourse;

  const {
    value: session,
    loading,
    error,
  } = useAsync(async () => {
    if (sessionCache) {
      return sessionCache;
    }
    const response = await axios.get<{ data: Session }>('/api/session');
    sessionCache = response.data.data;
    return sessionCache;
  }, []);

  useEffect(() => {
    if (!error) {
      return;
    }
    const { pathname, search } = document.location;
    const redirectUrl = encodeURIComponent(`${pathname}${search}`);
    Router.push('/login', { pathname: '/login', query: { url: redirectUrl } });
  }, [error]);

  if (session && props.adminOnly && !session.isAdmin) {
    return (
      <Result
        status="warning"
        title="You don't have required role to access this page"
        extra={
          <Button type="primary" key="console" onClick={() => window.history.back()}>
            Go Back
          </Button>
        }
      />
    );
  }

  if (session && allowedRoles && course) {
    const { courses, isAdmin } = session;
    const id = course.id;

    if (!isAdmin) {
      const roles = courses?.[id]?.roles ?? [];
      if (!allowedRoles.some(role => roles.includes(role))) {
        return (
          <Result
            status="warning"
            title="You don't have required role to access this page"
            extra={
              <Button type="primary" key="console" onClick={() => window.history.back()}>
                Go Back
              </Button>
            }
          />
        );
      }
    }
  }
  if (session) {
    return <SessionContext.Provider value={session}>{props.children}</SessionContext.Provider>;
  }
  return <LoadingScreen show={loading} />;
}

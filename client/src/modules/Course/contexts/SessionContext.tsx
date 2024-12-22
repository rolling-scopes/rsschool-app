import useRequest from 'ahooks/lib/useRequest';
import { Button, Result } from 'antd';
import type { ProfileCourseDto } from 'api';
import axios from 'axios';
import { LoadingScreen } from 'components/LoadingScreen';
import type { Session } from 'components/withSession';
import { hasRoleInAnyCourse } from 'domain/user';
import Router from 'next/router';
import React, { useEffect } from 'react';
import { CourseRole } from 'services/models';
import { useActiveCourseContext } from './ActiveCourseContext';

export const SessionContext = React.createContext<Session>({} as Session);

type Props = React.PropsWithChildren<{
  allowedRoles?: CourseRole[];
  course?: ProfileCourseDto;
  adminOnly?: boolean;
  anyCoursePowerUser?: boolean;
  hirerOnly?: boolean;
}>;

const AccessDeniedWarning = () => (
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

export function SessionProvider(props: Props) {
  const { allowedRoles, anyCoursePowerUser } = props;
  const activeCourse = useActiveCourseContext().course;
  const course = props.course ?? activeCourse;

  const {
    data: session,
    loading,
    error,
  } = useRequest(async () => {
    const response = await axios.get<{ data: Session }>('/api/session');
    return response.data.data;
  });

  useEffect(() => {
    if (!error) {
      return;
    }
    const { pathname, search } = document.location;
    const redirectUrl = encodeURIComponent(`${pathname}${search}`);
    Router.push('/login', { pathname: '/login', query: { url: redirectUrl } });
  }, [error]);

  if (session && props.adminOnly && !session.isAdmin) {
    return <AccessDeniedWarning />;
  }

  if (session && props.hirerOnly && !session.isHirer && !session.isAdmin) {
    return <AccessDeniedWarning />;
  }

  if (session && allowedRoles && course) {
    const { courses, isAdmin } = session;
    const id = course.id;

    if (!isAdmin) {
      const roles = courses?.[id]?.roles ?? [];
      const hasRoleInCurrentCourse = allowedRoles.some(role => roles.includes(role));
      const isAnyCoursePowerUser = anyCoursePowerUser && allowedRoles.some(role => hasRoleInAnyCourse(session, role));

      if (!hasRoleInCurrentCourse && !isAnyCoursePowerUser) {
        return <AccessDeniedWarning />;
      }
    }
  }
  if (session) {
    return <SessionContext.Provider value={session}>{props.children}</SessionContext.Provider>;
  }
  return <LoadingScreen show={loading} />;
}

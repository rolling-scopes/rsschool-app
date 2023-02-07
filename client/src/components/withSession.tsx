import axios from 'axios';
import { hasRoleInAnyCourse, isAnyCoursePowerUser } from 'domain/user';
import { NotAccess } from 'modules/NotAccess';
import Router from 'next/router';
import React, { useState } from 'react';
import { useAsync } from 'react-use';
import { CourseRole } from 'services/models';
import { LoadingScreen } from './LoadingScreen';

export interface CourseInfo {
  mentorId?: number;
  studentId?: number;
  roles: CourseRole[];
  isExpelled?: boolean;
}

export interface Session {
  id: number;
  githubId: string;
  isAdmin: boolean;
  isHirer: boolean;
  isActivist: boolean;
  courses: { [courseId: number | string]: CourseInfo | undefined };
}

let sessionCache: Session | undefined;

type AccessSettings = {
  requiredCourseRole?: CourseRole;
  onlyForAdmin?: boolean;
  requiredAnyCourseRole?: CourseRole;
  onlyForAnyCoursePowerUser?: boolean;
};

function withSession(WrappedComponent: React.ComponentType<any>, accessSettings?: AccessSettings) {
  return (props: any) => {
    const [session, setSession] = useState<Session | undefined>();

    const { loading } = useAsync(async () => {
      if (sessionCache != null) {
        setSession(sessionCache);
        return;
      }
      try {
        const response = await axios.get<{ data: Session }>(`/api/session`);
        sessionCache = response.data.data;
        setSession(sessionCache);
      } catch (e) {
        const { pathname, search } = document.location;
        const redirectUrl = encodeURIComponent(`${pathname}${search}`);
        Router.push('/login', { pathname: '/login', query: { url: redirectUrl } });
      }
    }, []);

    if (session && accessSettings?.onlyForAdmin && !session.isAdmin) {
      return <NotAccess session={session} />;
    }

    if (session && accessSettings?.onlyForAnyCoursePowerUser && !isAnyCoursePowerUser(session)) {
      return <NotAccess session={session} />;
    }

    if (session && !session.isAdmin && accessSettings?.requiredAnyCourseRole) {
      if (!hasRoleInAnyCourse(session, accessSettings.requiredAnyCourseRole)) {
        return <NotAccess session={session} />;
      }
    }

    if (session && accessSettings?.requiredCourseRole) {
      const { courses, isAdmin } = session;
      const id = props.course.id;
      if (!courses?.[id]?.roles.includes(accessSettings.requiredCourseRole) && !isAdmin) {
        return (
          <h4 className="m-5 d-flex justify-content-center">
            You are not [{accessSettings.requiredCourseRole}] in {props.course.alias}
          </h4>
        );
      }
    }
    return <LoadingScreen show={loading}>{session && <WrappedComponent session={session} {...props} />}</LoadingScreen>;
  };
}

export default withSession;
export { withSession };

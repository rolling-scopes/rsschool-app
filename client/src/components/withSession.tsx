import axios from 'axios';
import Router from 'next/router';
import React, { useState } from 'react';
import { useAsync } from 'react-use';
import { LoadingScreen } from './LoadingScreen';
import { useLoading } from './useLoading';

export const enum CourseRole {
  TaskOwner = 'taskOwner',
  JuryActivist = 'juryActivist',
  Manager = 'manager',
  Supervisor = 'supervisor',
  Student = 'student',
  Mentor = 'mentor',
}

export interface CourseInfo {
  mentorId?: number;
  studentId?: number;
  roles: CourseRole[];
}

export interface Session {
  id: number;
  githubId: string;
  isAdmin: boolean;
  isHirer: boolean;
  isActivist: boolean;
  courses: { [courseId: number | string]: CourseInfo };
}

let sessionCache: Session | undefined;

function withSession(WrappedComponent: React.ComponentType<any>, requiredRole?: CourseRole) {
  return (props: any) => {
    const [isLoading, withLoading] = useLoading(true);
    const [session, setSession] = useState<Session | undefined>();

    useAsync(
      withLoading(async () => {
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
      }),
      [],
    );

    if (session && requiredRole) {
      const { courses, isAdmin } = session;
      const { id } = props.course;
      if (courses[id].roles.includes(requiredRole) && !isAdmin) {
        return (
          <h4 className="m-5 d-flex justify-content-center">
            You are not [{requiredRole}] in {props.course.alias}
          </h4>
        );
      }
    }
    return (
      <LoadingScreen show={isLoading}>{session && <WrappedComponent session={session} {...props} />}</LoadingScreen>
    );
  };
}

export default withSession;
export { withSession };

import axios from 'axios';
import Router from 'next/router';
import React, { useState } from 'react';
import { useAsync } from 'react-use';
import { LoadingScreen } from './LoadingScreen';
import { useLoading } from './useLoading';

export type Role = 'student' | 'mentor' | 'coursemanager';

export interface Session {
  id: number;
  githubId: string;
  isAdmin: boolean;
  isHirer: boolean;
  isActivist: boolean;
  roles: { [key: number]: Role };
  coursesRoles?: { [key: string]: ('taskOwner' | 'juryActivist' | 'manager' | 'supervisor')[] | undefined };
}

let sessionCache: Session | undefined;

function withSession(WrappedComponent: React.ComponentType<any>, requiredRole?: Role) {
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
      const { roles, isAdmin } = session;
      if (roles[props.course.id] !== requiredRole && !isAdmin) {
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

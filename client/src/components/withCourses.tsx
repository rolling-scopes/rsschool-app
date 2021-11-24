import { NextPageContext } from 'next';
import * as React from 'react';
import { UserService } from 'services/user';
import { parse } from 'cookie';

function withCourses(WrappedComponent: React.ComponentType<any>) {
  return class extends React.PureComponent {
    static async getInitialProps(ctx: NextPageContext) {
      try {
        const cookies = parse(ctx.req?.headers.cookie || '');
        const courses = await new UserService(cookies['auth-token']).getCourses();
        return { courses };
      } catch (err) {
        const error = err as Error;
        console.error(error?.message);
        return { courses: [] };
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}

export default withCourses;

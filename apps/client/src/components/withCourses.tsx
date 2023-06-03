import { NextPageContext } from 'next';
import * as React from 'react';
import { UserService } from 'services/user';
import { getTokenFromContext } from 'utils/server';

function withCourses(WrappedComponent: React.ComponentType<any>) {
  return class extends React.PureComponent {
    static async getInitialProps(ctx: NextPageContext) {
      try {
        const token = getTokenFromContext(ctx);
        if (token == null) {
          return { courses: [] };
        }
        const courses = await new UserService(token).getCourses();
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

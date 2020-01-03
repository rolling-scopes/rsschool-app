import { NextPageContext } from 'next';
import * as React from 'react';
import { UserService } from 'services/user';

function withCourses(WrappedComponent: React.ComponentType<any>) {
  return class extends React.PureComponent {
    static async getInitialProps(ctx: NextPageContext) {
      try {
        const courses = await new UserService(ctx).getCourses();
        return { courses };
      } catch (e) {
        console.error(e.message);
        return { courses: [] };
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}

export default withCourses;

import * as React from 'react';
import { NextPageContext } from 'next';
import { UserService } from 'services/user';

function withCourses(WrappedComponent: React.ComponentType<any>) {
  return class extends React.PureComponent {
    static async getInitialProps(context: NextPageContext) {
      try {
        UserService.cookie = context && context.req ? context.req.headers.cookie : undefined;
        const service = new UserService();
        const courses = await service.getCourses();
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

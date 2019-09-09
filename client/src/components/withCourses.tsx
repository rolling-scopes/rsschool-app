import * as React from 'react';
import { NextPageContext } from 'next';
import { CourseService } from 'services/course';

function withCourses(WrappedComponent: React.ComponentType<any>) {
  return class extends React.PureComponent {
    static async getInitialProps(context: NextPageContext) {
      try {
        CourseService.cookie = context && context.req ? context.req.headers.cookie : undefined;
        const service = new CourseService();
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

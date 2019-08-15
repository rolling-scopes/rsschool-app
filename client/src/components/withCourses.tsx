import * as React from 'react';
import { CourseService } from 'services/course';

function withCourses(WrappedComponent: React.ComponentType<any>) {
  return class extends React.PureComponent {
    static async getInitialProps() {
      try {
        const service = new CourseService();
        const courses = await service.getCourses();
        return { courses };
      } catch (e) {
        return {};
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}

export default withCourses;

import * as React from 'react';
import { NextPageContext } from 'next';
import { Course, CourseService } from 'services/course';
import { Session } from './withSession';

function withCourseData(WrappedComponent: React.ComponentType<any>) {
  return class extends React.PureComponent<{ course?: Course; session: Session }> {
    static async getInitialProps(context: NextPageContext) {
      try {
        CourseService.cookie = context && context.req ? context.req.headers.cookie : undefined;
        const service = new CourseService();
        const alias = context.query.course;
        const courses = await service.getCourses();
        const course = courses.find(c => c.alias === alias);
        return { course };
      } catch (e) {
        console.error(e);
        return {};
      }
    }

    render() {
      if (!this.props.course) {
        return <div>No Data</div>;
      }
      return <WrappedComponent {...this.props} />;
    }
  };
}

export default withCourseData;

import * as React from 'react';
import { NextPageContext } from 'next';
import { Course, CourseService } from 'services/course';
import { Alert, Row, Col } from 'antd';
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
        console.error(e.message);
        return {};
      }
    }

    render() {
      if (!this.props.course) {
        return (
          <Row type="flex" justify="center">
            <Col md={12} xs={18} style={{ marginTop: '60px' }}>
              <Alert
                message="No Access"
                description="Probably you do not participate in the course. Please register or choose another course."
                type="error"
              />
            </Col>
          </Row>
        );
      }
      return <WrappedComponent {...this.props} />;
    }
  };
}

export default withCourseData;

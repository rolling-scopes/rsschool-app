import * as React from 'react';
import { NextPageContext } from 'next';
import { Course } from 'services/course';
import { UserService } from 'services/user';

import { Alert, Row, Col } from 'antd';
import { Session } from './withSession';

function withCourseData(WrappedComponent: React.ComponentType<any>, courseId?: number) {
  return class extends React.PureComponent<{ course?: Course | null; session: Session }> {
    static async getInitialProps(context: NextPageContext) {
      try {
        UserService.cookie = context && context.req ? context.req.headers.cookie : undefined;
        const service = new UserService();
        const alias = context.query.course;
        const courses = await service.getCourses();
        const course = courses.find(c => (courseId ? c.id === courseId : c.alias === alias)) || null;
        return { course };
      } catch (e) {
        console.error(e.message);
        return { course: undefined };
      }
    }

    render() {
      if (this.props.course || this.props.course === undefined) {
        return <WrappedComponent {...this.props} />;
      }
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
  };
}

export default withCourseData;

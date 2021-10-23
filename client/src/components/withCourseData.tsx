import { Alert, Col, Row } from 'antd';
import { NextPageContext } from 'next';
import * as React from 'react';
import { Course } from 'services/models';
import { UserService } from 'services/user';
import { Session } from './withSession';

function withCourseData(WrappedComponent: React.ComponentType<any>, courseId?: number) {
  return class extends React.PureComponent<{ course?: Course | null; session: Session }> {
    static async getInitialProps(context: NextPageContext) {
      try {
        const alias = context.query.course;
        const courses = await new UserService(context).getCourses();
        const course = courses.find(c => (courseId ? c.id === courseId : c.alias === alias)) || null;
        return { course };
      } catch (err) {
        const error = err as Error;
        console.error(error?.message);
        return { course: undefined };
      }
    }

    render() {
      if (this.props.course || this.props.course === undefined) {
        return <WrappedComponent {...this.props} />;
      }
      return (
        <Row justify="center">
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

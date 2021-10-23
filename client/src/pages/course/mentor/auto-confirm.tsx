import { Button, Col, Result, Row, Typography } from 'antd';
import { PageLayout } from 'components';
import withSession, { Session } from 'components/withSession';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { CoursesService } from 'services/courses';
import { MentorRegistryService } from 'services/mentorRegistry';
import { Course } from 'common/models';

const mentorRegistry = new MentorRegistryService();
function Page(props: { session: Session }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [noAccess, setNoAccess] = useState(false);
  const [success, setSuccess] = useState(false);
  const [course, setCourse] = useState(null as Course | null);

  useAsync(async () => {
    try {
      setLoading(true);
      const courseAlias = router.query['course'];
      const courses = await new CoursesService().getCourses();
      const course = courses.find(c => c.alias === courseAlias) ?? null;
      if (course == null) {
        setNoAccess(true);
        return;
      }

      setCourse(course);
      const mentor = await mentorRegistry.getMentor();

      if (!mentor.preselectedCourses?.includes(course?.id)) {
        setNoAccess(true);
        return;
      }

      await new CourseService(course.id).createMentor(props.session.githubId, {
        maxStudentsLimit: mentor.maxStudentsLimit,
        preferedStudentsLocation: mentor.preferedStudentsLocation,
        students: [],
      });

      setSuccess(true);
    } catch {
      setNoAccess(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const pageProps = {
    loading,
    title: 'Confirm Mentorship',
    githubId: props.session.githubId,
    courseName: course?.name,
  };

  if (noAccess) {
    return (
      <PageLayout {...pageProps}>
        <Result status={'403' as any} title="You are not preselected as mentor to the course" />
      </PageLayout>
    );
  }

  if (course == null) {
    return null;
  }

  if (success) {
    return (
      <PageLayout {...pageProps}>
        <SuccessComponent />
      </PageLayout>
    );
  }

  return <PageLayout {...pageProps}>Please wait...</PageLayout>;
}

const SuccessComponent = () => {
  const titleCmp = (
    <Row gutter={24} justify="center">
      <Col xs={18} sm={16} md={12}>
        <p>Thanks for the confirmation!</p>
        <p>You are mentor now!</p>
        <Typography.Paragraph type="secondary">
          Join our <a href="https://t.me/joinchat/HqpGRxNRANkGN2xx9bL8zQ">RSSchool Mentors FAQ</a> Telegram group.
        </Typography.Paragraph>
        <p>
          <Button type="primary" size="large" href="/">
            Go to Home Page
          </Button>
        </p>
      </Col>
    </Row>
  );
  return <Result status="success" title={titleCmp} />;
};

export default withSession(Page);

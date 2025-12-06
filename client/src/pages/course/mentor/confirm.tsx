import { Button, Col, Form, message, Result, Row, Typography } from 'antd';
import { AuthApi, CourseDto as Course, DiscordServersApi } from 'api';
import { PageLayout, PageLayoutSimple } from 'components/PageLayout';
import { useRouter } from 'next/router';
import { useContext, useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseService } from 'services/course';
import { CoursesService } from 'services/courses';
import { MentorRegistryService, MentorResponse } from 'services/mentorRegistry';
import { Warning } from 'components/Warning';
import { MentorOptions } from 'components/MentorOptions';
import { SessionContext, SessionProvider } from 'modules/Course/contexts';
import { LoadingScreen } from '@client/components/LoadingScreen';
import { useAsyncEffect } from 'ahooks';

const { Link } = Typography;

type SuccessComponentProps = {
  courseId: number;
  discordServerId: number;
};

const mentorRegistry = new MentorRegistryService();
const discordServer = new DiscordServersApi();
const authApi = new AuthApi();

function Page() {
  const session = useContext(SessionContext);
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [noAccess, setNoAccess] = useState<boolean | null>(null);
  const [isPreferredCourse, setIsPreferredCourse] = useState<boolean | null>(null);
  const [success, setSuccess] = useState(false);
  const [mentorData, setMentorData] = useState<MentorResponse | null>(null);
  const [course, setCourse] = useState(null as Course | null);

  const courseService = useMemo(() => {
    if (!course) {
      return null;
    }
    return new CourseService(course.id);
  }, [course]);

  const mapMentorData = (
    mentor: MentorResponse | null,
    course: Course | null,
  ): Omit<MentorResponse, 'preferedStudentsLocation'> => {
    const courseMinStudentsPerMentorValue = course?.minStudentsPerMentor || 0;
    const shouldUseCourseMinimum = courseMinStudentsPerMentorValue > Number(mentor?.maxStudentsLimit || 0);
    if (mentor) {
      return {
        ...mentor,
        maxStudentsLimit: shouldUseCourseMinimum ? courseMinStudentsPerMentorValue : mentor.maxStudentsLimit,
      };
    }
    return {
      maxStudentsLimit: courseMinStudentsPerMentorValue,
      preferredCourses: [],
      preselectedCourses: [],
    };
  };

  useAsync(async () => {
    try {
      setLoading(true);
      const courseAlias = (router.query?.course as string).toLowerCase();
      if (courseAlias == null) {
        setIsPreferredCourse(false);
        return;
      }
      const courses = await new CoursesService().getCourses();
      const course = courses.find(c => c.alias.toLowerCase() === courseAlias) ?? null;
      setCourse(course);
      const mentor = await mentorRegistry.getMentor();
      const mappedMentorData = mapMentorData(mentor, course);
      const preferredCourse = course?.id ? mappedMentorData?.preferredCourses?.includes(course?.id) : null;
      const preselectedCourses = course?.id ? mappedMentorData?.preselectedCourses?.includes(course?.id) : null;
      setIsPreferredCourse(preferredCourse);
      if (preselectedCourses === false) {
        setNoAccess(true);
        return;
      } else {
        setNoAccess(false);
        setMentorData(mentor);
        form.setFieldsValue(mentor);
      }
    } catch {
      setNoAccess(null);
    } finally {
      setLoading(false);
    }
  }, [router.query.course]);

  const handleSubmit = async (values: any) => {
    if (loading) {
      return;
    }
    try {
      setLoading(true);

      await courseService?.createMentor(session.githubId, {
        maxStudentsLimit: values.maxStudentsLimit,
        preferedStudentsLocation: values.preferedStudentsLocation,
        students: values.students?.map((s: any) => Number(s.value)) ?? [],
      });

      await authApi.clearAuthUserSessionCache(session.id);
      setSuccess(true);
    } catch {
      message.error('An error occurred. Please try later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || (noAccess === null && isPreferredCourse === null)) {
    return null;
  }

  if (course == null) {
    return <Warning imagePath="/svg/err.svg" imageName="Course Not Found" textMessage="Sorry, Course Not Found" />;
  }

  const pageProps = {
    loading,
    title: 'Confirm Mentorship',
    githubId: session.githubId,
    courseName: course.name,
  };

  if (noAccess && !isPreferredCourse) {
    const message = (
      <div>
        <Link href={`/registry/mentor?course=${router.query?.course}`}>
          <a>Register as a Mentor for the Course</a>
        </Link>
      </div>
    );
    return <Warning imagePath="/svg/wanted-mentors.svg" imageName="Not registered" textMessage={message} />;
  }

  if (noAccess && isPreferredCourse) {
    const message = (
      <div>
        <Row justify="center">
          <h1 style={{ fontSize: '32px', marginBottom: 15, maxWidth: 600, textAlign: 'center' }}>
            Thank you for registration as a mentor for Rolling Scopes School
          </h1>
        </Row>
        <Row justify="center">
          <h2 style={{ fontSize: '19px', marginBottom: 15, maxWidth: 600, textAlign: 'center', fontWeight: 100 }}>
            <p>
              Hello, our future mentor, we are very happy to see you in The Rolling Scopes School. But before you start
              your journey we need to consider your application and submit you to a course.
            </p>
            <p style={{ marginBottom: 15 }}>
              It can take a little time. We will send you another mail with next steps later
            </p>
            <p style={{ fontWeight: 500 }}>
              We really appreciate your interest for school.
              <br />
              See you soon.
            </p>
          </h2>
        </Row>
      </div>
    );
    return <Warning imagePath="/images/rs-hero.png" imageName="You are RS hero" textMessage={message} />;
  }

  if (success) {
    return (
      <PageLayout {...pageProps}>
        <SuccessComponent courseId={course.id} discordServerId={course.discordServerId} />
      </PageLayout>
    );
  }

  return (
    <PageLayoutSimple {...pageProps}>
      <Typography.Paragraph>
        We kindly ask you confirm your desire to be mentor in {course.name} course. Just in case, you can change your
        preference below and select student which you want to mentor
      </Typography.Paragraph>
      <MentorOptions form={form} mentorData={mentorData} handleSubmit={handleSubmit} course={course} />
    </PageLayoutSimple>
  );
}

const SuccessComponent = ({ courseId, discordServerId }: SuccessComponentProps) => {
  const [mentorsChat, setMentorsChat] = useState<string | null>(null);

  useAsyncEffect(async () => {
    const telegramInviteLinkResponse = await discordServer.getInviteLinkByDiscordServerId(courseId, discordServerId);
    setMentorsChat(telegramInviteLinkResponse.data);
  }, [discordServerId]);

  if (!mentorsChat) return <LoadingScreen show={!mentorsChat} />;

  const titleCmp = (
    <Row gutter={24} justify="center">
      <Col xs={18} sm={16} md={12}>
        <p>Thanks for the confirmation!</p>
        <p>You are mentor now!</p>
        <Typography.Paragraph type="secondary">
          Join our <a href={mentorsChat}>RSSchool Mentors FAQ</a> Telegram group.
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

export default function () {
  return (
    <SessionProvider>
      <Page />
    </SessionProvider>
  );
}

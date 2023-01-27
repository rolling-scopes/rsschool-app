import { Form, message, Row, Steps, Typography } from 'antd';
import { CourseDto, DisciplineDto, DisciplinesApi, ProfileApi } from 'api';
import { Location } from 'common/models';
import { RegistrationPageLayout } from 'components/RegistartionPageLayout';
import { Session } from 'components/withSession';
import css from 'styled-jsx/css';
import { MentorshipSection, DoneSection, GeneralSection, Footer } from 'modules/Registry/components';
import { useCallback, useEffect, useState } from 'react';
import { useAsync, useUpdate } from 'react-use';
import { CdnService } from 'services/cdn';
import type { Course } from 'services/models';
import { UserFull, UserService } from 'services/user';
import { FormData, getInitialValues } from './formData';
import { ERROR_MESSAGES } from 'modules/Registry/constants';

export type Props = {
  courses?: Course[];
  session: Session;
};

const { Step } = Steps;
const { Title, Paragraph } = Typography;

const cdnService = new CdnService();
const userService = new UserService();
const profileApi = new ProfileApi();
const disciplinesApi = new DisciplinesApi();

export function MentorRegistry(props: Props & { courseAlias?: string }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null as Location | null);
  const [courses, setCourses] = useState([] as Course[]);
  const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);
  const [checkedList, setCheckedListCourse] = useState([] as number[]);
  const [initialData, setInitialData] = useState<Partial<UserFull> | null>(null);
  const [currentStep, setCurrentSteps] = useState(0);
  const [resume, setResume] = useState<FormData | undefined>();

  const update = useUpdate();

  useAsync(async () => {
    setLoading(true);
    const [profile, courses, disciplinesData] = await Promise.all([
      userService.getMyProfile(),
      cdnService.getCourses(),
      disciplinesApi.getDisciplines(),
    ]);
    const activeCourses = getActiveCourses(courses, props.courseAlias);
    const checkedListCourse = props.courseAlias
      ? courses.filter((course: Course) => course.alias === props.courseAlias).map(({ id }: Course) => id)
      : [];

    setInitialData(profile);
    setCourses(activeCourses);
    setCheckedListCourse(checkedListCourse);
    setDisciplines(disciplinesData.data);

    if (initialData) {
      setResume(getInitialValues(initialData, checkedList));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    setLocation({
      countryName: initialData?.countryName,
      cityName: initialData?.cityName,
    } as Location);

    if (initialData) {
      setResume(getInitialValues(initialData, checkedList));
    }
  }, [initialData, checkedList]);

  const handleSubmit = useCallback(
    async (model: any) => {
      const data = { ...resume, ...model };
      setResume(data);
      if (!currentStep) {
        setCurrentSteps(previousStep => previousStep + 1);
      } else {
        setLoading(true);

        const {
          technicalMentoring,
          preferedCourses,
          preferedStudentsLocation,
          maxStudentsLimit,
          languagesMentoring,
          location,
        } = data;

        const registryModel = {
          preferedCourses,
          maxStudentsLimit,
          preferedStudentsLocation,
          languagesMentoring,
          technicalMentoring,
        };

        const userModel = {
          cityName: location?.cityName,
          countryName: location?.countryName,
          firstName: data.firstName,
          lastName: data.lastName,
          primaryEmail: data.primaryEmail,
          contactsEpamEmail: data.contactsEpamEmail,

          contactsTelegram: data.contactsTelegram,
          contactsSkype: data.contactsSkype,
          contactsWhatsApp: data.contactsWhatsApp,
          contactsEmail: data.contactsEmail,
          contactsNotes: data.contactsNotes,
          contactsPhone: data.contactsPhone,
          aboutMyself: data.aboutMyself,
          languages: languagesMentoring,
        };

        const requests = [profileApi.updateUser(userModel), cdnService.registerMentor(registryModel)];

        try {
          await Promise.all(requests);
          setCurrentSteps(previousStep => previousStep + 1);
        } catch (e) {
          message.error(ERROR_MESSAGES.tryLater);
        } finally {
          setLoading(false);
        }
      }
    },
    [resume, currentStep],
  );

  const onPrevious = () => {
    setCurrentSteps(previousStep => previousStep - 1);
  };

  const steps = [
    { title: 'General', content: <GeneralSection location={location} setLocation={setLocation} /> },
    {
      title: 'Mentorship',
      content: (
        <MentorshipSection
          checkedList={checkedList}
          courses={courses}
          disciplines={disciplines}
          onPrevious={onPrevious}
        />
      ),
    },
    { title: 'Done', content: <DoneSection /> },
  ];

  return (
    <RegistrationPageLayout loading={loading} githubId={props.session.githubId}>
      {resume ? (
        <Form
          layout="horizontal"
          form={form}
          initialValues={resume}
          onChange={update}
          onFinish={handleSubmit}
          onFinishFailed={({ errorFields: [errorField] }) => form.scrollToField(errorField.name)}
          style={{ width: '100%' }}
        >
          <Row
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              maxWidth: '960px',
              margin: '0 auto',
              padding: '24px 0',
              gap: '24px',
            }}
          >
            <Row style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Title
                level={1}
                style={{
                  marginBottom: '12px',
                  color: 'rgba(0, 0, 0, 0.85)',
                }}
              >
                Mentors registration
              </Title>
              <Paragraph
                style={{
                  marginBottom: 0,
                  color: 'rgba(0, 0, 0, 0.45)',
                }}
              >
                Free courses from the developer community
              </Paragraph>
            </Row>
            <Row
              style={{
                margin: '0 auto',
                padding: '16px 60px',
                height: '64px',
                width: '100%',
                maxWidth: '960px',
                background: '#FFFFFF',
                borderRadius: '2px',
              }}
            >
              <Steps current={currentStep} responsive={false}>
                {steps.map(item => (
                  <Step key={item.title} title={item.title} />
                ))}
              </Steps>
            </Row>
            {steps[currentStep].content}
            <Footer />
          </Row>
          <style jsx>{styles}</style>
        </Form>
      ) : null}
    </RegistrationPageLayout>
  );
}

function getActiveCourses(courses: CourseDto[], courseAlias?: string) {
  return courseAlias
    ? courses.filter((course: Course) => course.alias === courseAlias)
    : courses
        .filter(course => (course.planned || !course.completed) && !course.inviteOnly && course.personalMentoring)
        .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

const styles = css`
  @media (max-width: 532px) {
    :global(.ant-steps-item-title) {
      width: 0;
      color: transparent !important;
    }
  }
`;

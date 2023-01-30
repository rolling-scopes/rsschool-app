import { Col, Form, Grid, message, Row, Space, Steps, Typography } from 'antd';
import { FormLayout } from 'antd/lib/form/Form';
import { useCallback, useEffect, useState } from 'react';
import { useAsync, useUpdate } from 'react-use';
import { CourseDto, DisciplineDto, DisciplinesApi, ProfileApi } from 'api';
import { Location } from 'common/models';
import { RegistrationPageLayout } from 'components/RegistartionPageLayout';
import { Session } from 'components/withSession';
import { MentorshipSection, DoneSection, GeneralSection, Footer } from 'modules/Registry/components';
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
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

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
  const { xs, sm, md, lg, xl, xxl } = useBreakpoint();
  const largeScreenSizes = [md, lg, xl, xxl];
  const isSmallScreen = xs || (sm && !largeScreenSizes.some(Boolean));
  const formLayout: FormLayout = isSmallScreen ? 'vertical' : 'horizontal';

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

  const formItemLayout = {
    labelCol: {
      sm: { offset: 4 },
      md: { span: 6, offset: 0 },
      xl: { span: 8, offset: 0 },
    },
    wrapperCol: {
      sm: { span: 16, offset: 4 },
      md: { span: 12, offset: 0 },
      xl: { span: 8, offset: 0 },
    },
  };

  return (
    <RegistrationPageLayout loading={loading} githubId={props.session.githubId}>
      {resume ? (
        <Row justify="center" style={{ paddingBlock: 24 }}>
          <Col xs={24} lg={18} xl={18} xxl={14}>
            <Form
              {...formItemLayout}
              layout={formLayout}
              form={form}
              initialValues={resume}
              onChange={update}
              onFinish={handleSubmit}
              scrollToFirstError
              onFinishFailed={({ errorFields: [errorField] }) => form.scrollToField(errorField.name)}
            >
              <Row justify="center" gutter={[0, 24]}>
                <Col>
                  <Space direction="vertical" align="center" size={0}>
                    <Title>Mentors registration</Title>
                    <Text type="secondary">Free courses from the developer community</Text>
                  </Space>
                </Col>
                <Col
                  span={24}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 2,
                    paddingBlock: 16,
                    paddingInline: 60,
                  }}
                >
                  <Steps current={currentStep} responsive={false}>
                    {steps.map(item => (
                      <Step key={item.title} title={xs ? null : item.title} />
                    ))}
                  </Steps>
                </Col>
                <Col span={24}>{steps[currentStep].content}</Col>
                <Col span={24} flex="none">
                  <Footer />
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
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

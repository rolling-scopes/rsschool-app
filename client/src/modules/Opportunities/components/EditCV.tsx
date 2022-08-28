import { useState, useCallback, createRef, ReactNode, CSSProperties, RefObject } from 'react';
import moment from 'moment';
import { Layout, Space, Button, Card, Modal, Typography, Row, Col } from 'antd';
import { ExclamationCircleTwoTone, SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import { ResumeCourseDto } from 'api';
import { LoadingScreen } from 'components/LoadingScreen';
import { ContactsForm, UserDataForm, VisibleCoursesForm } from './forms';
import {
  Contacts,
  UserData,
  AllUserCVData,
  AllDataToSubmit,
  UserDataToSubmit,
  VisibleCoursesFormData,
  VisibleCourses,
} from 'modules/Opportunities/models';
import { OpportunitiesService } from 'modules/Opportunities/services/opportunities';

const { Content } = Layout;
const { Paragraph, Text, Title } = Typography;

type Props = {
  githubId: string;
  contacts: Contacts | null;
  userData: UserData | null;
  updatedAt: string | null;
  visibleCourses: number[];
  courses: ResumeCourseDto[] | null;
  switchView: () => void;
  onRemoveConsent: () => void;
  onUpdateResume?: () => void;
};

const cvService = new OpportunitiesService();

const buttonStyle = { width: 'fit-content', margin: '5px' };

function EditCV(props: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [contacts, setContacts] = useState<Contacts | null>(props.contacts);
  const [userData, setUserData] = useState<UserData | null>(props.userData);
  const [visibleCourses, setVisibleCourses] = useState<number[] | null>(props.visibleCourses);

  const userFormRef: RefObject<FormInstance> = createRef();
  const contactsFormRef: RefObject<FormInstance> = createRef();
  const visibleCoursesFormRef: RefObject<FormInstance> = createRef();

  const showDeletionConfirmationModal = useCallback(() => {
    const textStyle: CSSProperties = { textAlign: 'center' };

    const title = (
      <Title level={3} style={{ textAlign: 'center' }}>
        <ExclamationCircleTwoTone twoToneColor="#d60000" /> <Text strong>Deleting CV</Text>
      </Title>
    );

    const message =
      'Are you sure you want to delete your CV? The information contained therein will be deleted and employers will not be able to access it.';
    const messageRu =
      'Вы уверены, что хотите удалить свое резюме? Информация, содержащаяся в нем, будет удалена, а работодатели не смогут получить к нему доступ.';
    const confirmationModalContent = (
      <>
        <Paragraph style={textStyle}>{message}</Paragraph>
        <Paragraph style={textStyle}>{messageRu}</Paragraph>
      </>
    );

    Modal.confirm({
      icon: null,
      title,
      content: confirmationModalContent,
      centered: true,
      maskClosable: true,
      okText: 'Delete my CV',
      onOk: () => props.onRemoveConsent(),
    });
  }, [props.onRemoveConsent]);

  const showWarningModal = useCallback(({ title, content }: { title: string; content: ReactNode }) => {
    Modal.warn({
      title,
      content,
      maskClosable: true,
    });
  }, []);

  const submitData = async (data: AllDataToSubmit) => {
    setLoading(true);

    const {
      avatarLink,
      desiredPosition,
      email,
      englishLevel,
      fullTime,
      github,
      linkedin,
      locations,
      militaryService,
      name,
      notes,
      phone,
      selfIntroLink,
      skype,
      startFrom,
      telegram,
      website,
      visibleCourses,
    } = data;

    const LOCATIONS_COUNT = 3;

    const topLocations = getTopLocations(locations, LOCATIONS_COUNT);

    const cvData: AllUserCVData = {
      selfIntroLink: nullifyConditional(selfIntroLink),
      militaryService,
      avatarLink: nullifyConditional(avatarLink),
      desiredPosition: nullifyConditional(desiredPosition),
      englishLevel,
      name: nullifyConditional(name),
      notes: nullifyConditional(notes),
      phone: nullifyConditional(phone),
      email: nullifyConditional(email),
      skype: nullifyConditional(skype),
      telegram: nullifyConditional(telegram),
      linkedin: nullifyConditional(linkedin),
      locations: topLocations,
      githubUsername: nullifyConditional(github),
      website: nullifyConditional(website),
      startFrom: startFrom && moment(startFrom).format('YYYY-MM-DD'),
      fullTime,
      visibleCourses,
    };

    const newCVData = await cvService.saveResumeData(cvData);

    const {
      selfIntroLink: newSelfIntroLink,
      militaryService: newMilitaryService,
      avatarLink: newAvatarLink,
      desiredPosition: newDesiredPosition,
      englishLevel: newEnglishLevel,
      name: newName,
      notes: newNotes,
      startFrom: newStartFrom,
      fullTime: newFullTime,
      phone: newPhone,
      email: newEmail,
      skype: newSkype,
      telegram: newTelegram,
      linkedin: newLinkedin,
      locations: newLocations,
      githubUsername: newGithub,
      website: newWebsite,
      visibleCourses: newVisibleCourses,
    } = newCVData;

    const newUserData: Omit<UserData, 'uuid'> = {
      selfIntroLink: newSelfIntroLink,
      militaryService: newMilitaryService,
      avatarLink: newAvatarLink,
      desiredPosition: newDesiredPosition,
      englishLevel: newEnglishLevel,
      name: newName,
      notes: newNotes,
      startFrom: newStartFrom,
      fullTime: newFullTime,
    };

    const newContacts: Contacts = {
      phone: newPhone,
      email: newEmail,
      skype: newSkype,
      telegram: newTelegram,
      linkedin: newLinkedin,
      locations: newLocations,
      github: newGithub,
      website: newWebsite,
    };

    setUserData(newUserData);
    setContacts(newContacts);
    setVisibleCourses(newVisibleCourses);

    setLoading(false);
    props.onUpdateResume?.();
  };

  const saveData = async (data: AllDataToSubmit) => {
    await submitData(data);
  };

  const getTopLocations = (locationsRaw: string | null, length: number) =>
    locationsRaw === null
      ? null
      : locationsRaw
          .split('\n')
          .slice(0, length)
          .map(location => location.trim())
          .join('\n');

  const nullifyConditional = (str?: string | null) => str?.trim() || null;

  const formatDate = (lastUpdatedAt: string) => {
    const expirationDate = new Date(lastUpdatedAt);
    const addZeroPadding = (num: number) => `0${num}`.slice(-2);
    const [year, month, date] = [expirationDate.getFullYear(), expirationDate.getMonth() + 1, expirationDate.getDate()];
    return `${year}-${addZeroPadding(month)}-${addZeroPadding(date)}`;
  };

  const hasInvalidFields = (form: FormInstance | null) =>
    !form ? false : form.getFieldsError().some(field => field.errors.length > 0);

  const getDataFromForms = () => {
    const userFormData: UserDataToSubmit = userFormRef.current?.getFieldsValue();
    const contactsFormData: Contacts = contactsFormRef.current?.getFieldsValue();
    const visibleCoursesFormData: VisibleCoursesFormData = visibleCoursesFormRef.current?.getFieldsValue() ?? {};

    const visibleCourses = Object.entries(visibleCoursesFormData).reduce<VisibleCourses>((acc, [id, isVisible]) => {
      if (isVisible) acc.push(Number(id));
      return acc;
    }, []);

    return {
      ...userFormData,
      ...contactsFormData,
      visibleCourses,
    };
  };

  const handleSave = async () => {
    if (hasInvalidFields(userFormRef.current) || hasInvalidFields(contactsFormRef.current)) {
      return showWarningModal({
        title: 'Some form fields do not meet validation criteria',
        content: 'Please fill it correctly and try again',
      });
    }

    const values = getDataFromForms();

    setLoading(true);

    await saveData(values);

    setLoading(false);
  };

  return (
    <LoadingScreen show={loading}>
      <Layout style={{ margin: 'auto', marginBottom: '10px', maxWidth: '960px' }}>
        <Content>
          <Space
            direction="horizontal"
            align="start"
            style={{ width: '100%', display: 'flex', backgroundColor: '#FFF', justifyContent: 'space-around' }}
          >
            <Col>
              <Row justify="center" style={{ marginBottom: '15px' }}>
                <Button
                  style={{ ...buttonStyle, backgroundColor: '#52C41A', borderColor: '#52C41A' }}
                  type="primary"
                  color="green"
                  htmlType="button"
                  onClick={() => handleSave()}
                  icon={<SaveOutlined />}
                >
                  Save CV
                </Button>
                <Button style={buttonStyle} type="default" htmlType="button" onClick={() => props.switchView()}>
                  Go to View
                </Button>
              </Row>
              <Row>{userData && <UserDataForm ref={userFormRef} userData={userData} />}</Row>
              <Row>
                {visibleCourses && (
                  <VisibleCoursesForm
                    ref={visibleCoursesFormRef}
                    courses={props.courses}
                    visibleCourses={visibleCourses}
                  />
                )}
              </Row>
              <Row>{contacts && <ContactsForm ref={contactsFormRef} contactsList={contacts} />}</Row>
              <Row>
                {props.updatedAt && (
                  <Card size="small" style={{ width: '100%' }}>
                    <Text>
                      Last update made: <Text strong>{formatDate(props.updatedAt)}</Text>
                    </Text>
                  </Card>
                )}
              </Row>
            </Col>
          </Space>
          <Row justify="center" style={{ paddingTop: '10px' }}>
            <Button
              style={buttonStyle}
              type="primary"
              danger
              htmlType="button"
              onClick={showDeletionConfirmationModal}
              icon={<DeleteOutlined />}
            >
              Delete my CV
            </Button>
          </Row>
        </Content>
      </Layout>
    </LoadingScreen>
  );
}

export default EditCV;

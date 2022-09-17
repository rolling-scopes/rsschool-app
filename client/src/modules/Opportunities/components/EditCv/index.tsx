import { useState, useCallback, createRef, ReactNode, RefObject } from 'react';
import moment from 'moment';
import { Layout, Space, Button, Modal, Row, Col } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import { ResumeCourseDto } from 'api';
import { LoadingScreen } from 'components/LoadingScreen';
import { ContactsForm } from './ContactsForm';
import { GeneralInfoForm } from './GeneralInfoForm';
import { VisibleCoursesForm } from './VisibleCoursesForm';
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

type Props = {
  githubId: string;
  contacts: Contacts | null;
  userData: UserData | null;
  visibleCourses: number[];
  courses: ResumeCourseDto[] | null;
  switchView: () => void;
  onRemoveConsent: () => void;
  onUpdateResume?: () => void;
};

const cvService = new OpportunitiesService();

const buttonStyle = { width: 'fit-content', margin: '5px' };

export const EditCV = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [contacts, setContacts] = useState<Contacts | null>(props.contacts);
  const [userData, setUserData] = useState<UserData | null>(props.userData);
  const [visibleCourses, setVisibleCourses] = useState<number[] | null>(props.visibleCourses);

  const userFormRef: RefObject<FormInstance> = createRef();
  const contactsFormRef: RefObject<FormInstance> = createRef();
  const visibleCoursesFormRef: RefObject<FormInstance> = createRef();

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
      locations: newLocations,
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
          .split(',')
          .slice(0, length)
          .map(location => location.trim())
          .join(',');

  const nullifyConditional = (str?: string | null) => str?.trim() || null;

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
                  onClick={handleSave}
                  icon={<SaveOutlined />}
                >
                  Save CV
                </Button>
                <Button style={buttonStyle} type="default" htmlType="button" onClick={() => props.switchView()}>
                  Cancel
                </Button>
              </Row>
              <Row>{userData && <GeneralInfoForm ref={userFormRef} userData={userData} />}</Row>
              <Row>{contacts && <ContactsForm ref={contactsFormRef} contactsList={contacts} />}</Row>
              <Row>
                {visibleCourses && (
                  <VisibleCoursesForm
                    ref={visibleCoursesFormRef}
                    courses={props.courses}
                    visibleCourses={visibleCourses}
                  />
                )}
              </Row>
            </Col>
          </Space>
        </Content>
      </Layout>
    </LoadingScreen>
  );
};

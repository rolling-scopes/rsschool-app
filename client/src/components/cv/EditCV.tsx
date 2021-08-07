import React, { useState, useCallback, useEffect, ReactNode } from 'react';
import moment from 'moment';
import { Layout, Space, Button, Card, Modal, Typography, Row, Col, Popconfirm } from 'antd';
import { LoadingScreen } from 'components/LoadingScreen';
import { ContactsForm, UserDataForm } from './forms';
import { Contacts, UserData, AllUserCVData } from '../../../../common/models/cv';
import { CVService } from 'services/cv';
import { UserService } from 'services/user';
import { CSSProperties, RefObject } from 'react';
import {
  WarningTwoTone,
  SaveOutlined,
  ClearOutlined,
  DeleteOutlined,
  FieldTimeOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';

const { Content } = Layout;
const { Paragraph, Text, Title } = Typography;

type Props = {
  ownerGithubId: string;
  withdrawConsent: () => void;
};

const cvService = new CVService();
const userService = new UserService();

function EditCV(props: Props) {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [contactsList, setContactsList] = useState<Contacts | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [expires, setExpiration] = useState<number | null>(null);

  const userFormRef: RefObject<FormInstance> = React.createRef();
  const contactsFormRef: RefObject<FormInstance> = React.createRef();

  const currentRefs: RefObject<FormInstance>[] = [userFormRef, contactsFormRef];

  const showDeletionConfirmationModal = () => {
    const textStyle: CSSProperties = { textAlign: 'center' };

    const title = (
      <Title level={3} style={{ textAlign: 'center' }}>
        <WarningTwoTone twoToneColor="#fcbe03" /> <Text strong>Are you sure?</Text>
        <WarningTwoTone twoToneColor="#fcbe03" />
      </Title>
    );

    const message =
      'Are you sure you want to delete your CV? The information contained therein will be deleted and employers will not be able to access it.';
    const messageRu =
      'Вы уверены, что хотите удалить свое резюме? Информация, содержащаяся в нем, будет удалена, а работодатели не смогут получить к нему доступ.';
    const confirmationModalContent = (
      <>
        <Paragraph style={textStyle} underline strong>
          {message}
        </Paragraph>
        <Paragraph style={textStyle} underline strong>
          {messageRu}
        </Paragraph>
      </>
    );

    Modal.confirm({
      icon: null,
      title,
      content: confirmationModalContent,
      centered: true,
      maskStyle: { backgroundColor: 'red' },
      maskClosable: true,
      onOk: () => props.withdrawConsent(),
    });
  };

  const showWarningModal = ({ title, content }: { title: string; content: ReactNode }) => {
    Modal.warn({
      title,
      content,
      maskClosable: true,
    });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);

    const cvData = await cvService.getEditCVData(props.ownerGithubId);

    const {
      notes,
      name,
      selfIntroLink,
      militaryService,
      avatarLink,
      desiredPosition,
      englishLevel,
      email,
      githubUsername,
      linkedin,
      locations,
      phone,
      skype,
      telegram,
      website,
      startFrom,
      fullTime,
      expires,
    } = cvData;

    const userData = {
      notes,
      name,
      selfIntroLink,
      militaryService,
      avatarLink,
      desiredPosition,
      englishLevel,
      startFrom,
      fullTime,
    };

    const contactsList = {
      email,
      github: githubUsername,
      linkedin,
      locations,
      phone,
      skype,
      telegram,
      website,
    };

    setContactsList(contactsList);
    setUserData(userData);
    setExpiration(Number(expires));

    setLoading(false);
  }, []);

  const submitData = async (data: any) => {
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
    } = data;

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
      locations: nullifyConditional(transformLocationsString(locations)),
      githubUsername: nullifyConditional(github),
      website: nullifyConditional(website),
      startFrom: startFrom && moment(startFrom).format('YYYY-MM-DD'),
      fullTime,
    };

    const newCVData = await cvService.saveCVData(cvData);

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
    } = newCVData;

    const newUserData: UserData = {
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
    setContactsList(newContacts);

    setLoading(false);
  };

  const resetFields = async () => {
    await fetchData();
  };

  const saveData = async (data: any) => {
    await submitData(data);
  };

  const transformLocationsString = (locationsRaw: string) => {
    const locations = locationsRaw.split(';');
    const firstThreeLocations = locations.slice(0, 3);
    const locationsTrimmed = firstThreeLocations.map(location => location.trim());
    const locationsStringified = locationsTrimmed.join(';');
    return locationsStringified;
  };

  const nullifyConditional = (str: string | null) => (str?.trim() === '' ? null : str);

  const formatDate = (expirationValue: number | null) => {
    if (expirationValue === null || expirationValue === 0) {
      return <Text strong>CV expiration date is not set</Text>;
    } else {
      const expirationDate = new Date(expirationValue);
      const addZeroPadding = (num: number) => `0${num}`.slice(-2);
      const [year, month, date] = [
        expirationDate.getFullYear(),
        expirationDate.getMonth() + 1,
        expirationDate.getDate(),
      ];
      const expirationDateFormatted = `${year}-${addZeroPadding(month)}-${addZeroPadding(date)}`;
      return (
        <Text>
          Expiration date: <Text strong>{expirationDateFormatted}</Text>
        </Text>
      );
    }
  };

  const checkFormsForValidationErrors = () => {
    const hasErrors = currentRefs.some(ref => {
      const fieldsToCheck = ref.current?.getFieldsError();
      if (fieldsToCheck?.some(field => field.errors.length > 0)) return true;
    });

    return hasErrors;
  };

  const checkNecessaryDataBeforeExtension = () => {
    if (userData && contactsList) {
      const dataToBeFilled = [
        userData.name,
        userData.desiredPosition,
        userData.englishLevel,
        userData.startFrom,
        contactsList.locations,
      ];
      return dataToBeFilled.some(field => field === null);
    }
    return true;
  };

  const getDataFromForms = () => {
    const values = currentRefs
      .map(ref => {
        return ref.current?.getFieldsValue();
      })
      .reduce((resObj, dataObj) => Object.assign(resObj, dataObj), {});
    return values;
  };

  const handleSave = async () => {
    const hasErrors = checkFormsForValidationErrors();

    if (hasErrors) {
      showWarningModal({
        title: 'Some form fields do not meet validation criteria',
        content: 'Please fill it correctly and try again',
      });
      return;
    }

    const values = getDataFromForms();

    setLoading(true);

    await saveData(values);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fillFromProfile = async () => {
    setLoading(true);

    const id = props.ownerGithubId;

    const profile = await userService.getProfileInfo(id);

    const name = profile.generalInfo?.name ?? null;
    const notes = profile.generalInfo?.aboutMyself ?? null;
    const location = profile.generalInfo?.location
      ? `${profile.generalInfo.location.cityName}, ${profile.generalInfo.location.countryName}`
      : null;

    const phone = profile.contacts?.phone ?? null;
    const email = profile.contacts?.email ?? null;
    const skype = profile.contacts?.skype ?? null;
    const telegram = profile.contacts?.telegram ?? null;
    const linkedin = profile.contacts?.linkedIn ?? null;

    const prevUserData = userData as UserData;
    const prevContacts = contactsList as Contacts;

    const newUserData = {
      ...prevUserData,
      name,
      notes,
    };

    const newContacts = {
      ...prevContacts,
      phone,
      email,
      skype,
      telegram,
      linkedin,
      location,
    };

    setUserData(newUserData);
    setContactsList(newContacts);

    setLoading(false);
  };

  const extendCV = async () => {
    const hasEmptyMandatoryFields = checkNecessaryDataBeforeExtension();

    if (hasEmptyMandatoryFields) {
      showWarningModal({
        title: 'You have to fill some field before extend CV',
        content: (
          <Text>
            Folliwing saved data <Text strong>must be filled</Text> to extend your CV: <Text strong>name</Text>,{' '}
            <Text strong>desired position</Text>, <Text strong>English level</Text>, <Text strong>work start date</Text>
            , <Text strong>location</Text>
          </Text>
        ),
      });
      return;
    }

    setLoading(true);

    const newExpirationDate = await cvService.extendCV();

    setExpiration(newExpirationDate);

    setLoading(false);
  };

  const buttonStyle = {
    borderRadius: '15px',
    margin: '5px 0',
  };

  return (
    <LoadingScreen show={isLoading}>
      <Layout style={{ margin: 'auto', marginBottom: '10px', maxWidth: '960px' }}>
        <Content>
          <Card>
            <Space
              direction="horizontal"
              align="start"
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}
            >
              {userData && <UserDataForm ref={userFormRef} userData={userData} />}
              <Col>
                <Row>{contactsList && <ContactsForm ref={contactsFormRef} contactsList={contactsList} />}</Row>
                <br />
                <Row>
                  <Card size="small" style={{ width: '100%' }} title="CV expiration status">
                    {formatDate(expires)}
                  </Card>
                </Row>
              </Col>
            </Space>
            <Button
              style={buttonStyle}
              block
              type="primary"
              htmlType="button"
              onClick={() => handleSave()}
              icon={<SaveOutlined />}
            >
              Save
            </Button>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Popconfirm
                title="Are you sure? Unsaved fields data will be reaplced with profile data."
                onConfirm={fillFromProfile}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  style={{ ...buttonStyle, width: '33%' }}
                  type="default"
                  htmlType="button"
                  icon={<CopyOutlined />}
                >
                  Get data from profile
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Are you sure you want to reset fields?"
                onConfirm={resetFields}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  style={{ ...buttonStyle, width: '21%' }}
                  type="default"
                  htmlType="button"
                  icon={<ClearOutlined />}
                >
                  Reset fields
                </Button>
              </Popconfirm>
              <Button
                style={{ ...buttonStyle, width: '21%' }}
                type="default"
                htmlType="button"
                onClick={extendCV}
                icon={<FieldTimeOutlined />}
              >
                Extend CV
              </Button>
              <Button
                style={{ ...buttonStyle, padding: '4px', width: '21%' }}
                type="primary"
                danger
                htmlType="button"
                onClick={showDeletionConfirmationModal}
                icon={<DeleteOutlined />}
              >
                Delete my CV
              </Button>
            </div>
          </Card>
        </Content>
      </Layout>
    </LoadingScreen>
  );
}

export default EditCV;

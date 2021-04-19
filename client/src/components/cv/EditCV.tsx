import React, { useState, useCallback, useEffect } from 'react';
import moment from 'moment';
import { Layout, Space, Button, Card, Modal, Typography, Row, Col } from 'antd';
import { LoadingScreen } from 'components/LoadingScreen';
import { ContactsForm, UserDataForm } from './forms';
import { Contacts, UserData, SaveCVData, GetCVData } from '../../../../common/models/cv';
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

const { Content } = Layout;
const { Paragraph, Text, Title } = Typography;

type State = {
  isLoading: boolean;
  contactsList: Contacts | null;
  userData: UserData | null;
  expires: number | null;
};

type Props = {
  ownerGithubId: string;
  withdrawConsent: () => void;
};

const cvService = new CVService();
const userService = new UserService();

function EditCV(props: Props) {
  const [state, setState] = useState<State>({
    isLoading: false,
    contactsList: null,
    userData: null,
    expires: null,
  });

  const userFormRef: RefObject<typeof UserDataForm> = React.createRef();
  const contactsFormRef: RefObject<typeof ContactsForm> = React.createRef();

  const showConfirmationModal = () => {
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

  const fetchData = useCallback(async () => {
    await setState({
      ...state,
      isLoading: true,
    });

    const cvData: GetCVData = await cvService.getCVData(props.ownerGithubId);

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
      location,
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
      location,
      phone,
      skype,
      telegram,
      website,
    };

    await setState({
      contactsList: contactsList,
      userData: userData,
      expires: Number(expires),
      isLoading: false,
    });
  }, []);

  const submitData = async (data: any) => {
    const {
      avatarLink,
      desiredPosition,
      email,
      englishLevel,
      fullTime,
      github,
      linkedin,
      location,
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

    const cvData: SaveCVData = {
      selfIntroLink,
      militaryService,
      avatarLink,
      desiredPosition,
      englishLevel,
      name,
      notes,
      phone,
      email,
      skype,
      telegram,
      linkedin,
      location,
      githubUsername: github,
      website,
      startFrom: startFrom && moment(startFrom).format('YYYY-MM-DD'),
      fullTime,
    };

    await cvService.saveCVData(cvData);
  };

  const handleSave = async (data: any) => {
    await submitData(data);
    await fetchData();
  };

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

  const getDataFromRefs = (refs: RefObject<any>[]) => {
    const values = refs
      .map(ref => ref.current!.getFieldsValue())
      .reduce((resObj, dataObj) => Object.assign(resObj, dataObj), {});
    handleSave(values);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fillFromProfile = async () => {
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

    const prevUserData = state.userData as UserData;
    const prevContacts = state.contactsList as Contacts;

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

    await setState({
      ...state,
      userData: newUserData,
      contactsList: newContacts,
    });
  };

  const resetFields = async () => {
    await fetchData();
  };

  const extendCV = async () => {
    await setState({
      ...state,
      isLoading: true,
    });
    const newExpirationDate = await cvService.extendCV();

    await setState({
      ...state,
      expires: newExpirationDate,
      isLoading: false,
    });
  };

  const { isLoading, contactsList, userData, expires } = state;

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
              onClick={() => getDataFromRefs([userFormRef, contactsFormRef])}
              icon={<SaveOutlined />}
            >
              Save
            </Button>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                style={{ ...buttonStyle, width: '33%' }}
                type="default"
                htmlType="button"
                onClick={() => fillFromProfile()}
                icon={<CopyOutlined />}
              >
                Get data from profile
              </Button>
              <Button
                style={{ ...buttonStyle, width: '21%' }}
                type="default"
                htmlType="button"
                onClick={resetFields}
                icon={<ClearOutlined />}
              >
                Reset fields
              </Button>
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
                style={{ ...buttonStyle, width: '21%' }}
                type="primary"
                danger
                htmlType="button"
                onClick={showConfirmationModal}
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

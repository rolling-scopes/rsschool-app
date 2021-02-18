import * as React from 'react';
import moment from 'moment';
import { Layout, Space, Button, Card, Modal, Typography } from 'antd';
import { LoadingScreen } from 'components/LoadingScreen';
import { ContactsForm, UserDataForm } from './forms';
import { Contacts, UserData, SaveCVData, GetCVData } from '../../../../common/models/cv';
import { UserService } from 'services/user';
import { CSSProperties, RefObject } from 'react';
import { WarningTwoTone, SaveOutlined, ClearOutlined, DeleteOutlined, FieldTimeOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Paragraph, Text, Title } = Typography;

type State = {
  isLoading: boolean;
  contactsList: Contacts | null;
  userData: UserData | null;
  expires: string | null;
};

type Props = {
  ownerId: string;
  withdrawConsent: () => void;
};

class EditCV extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
    contactsList: null,
    userData: null,
    expires: null
  };

  private userFormRef: RefObject<typeof UserDataForm> = React.createRef();
  private contactsFormRef: RefObject<typeof ContactsForm> = React.createRef();

  private userService = new UserService();

  private nullifyConditional(value: string | null) {
    return value === '' ? null : value;
  }

  private showConfirmationModal() {
    const textStyle: CSSProperties = { textAlign: 'center' };

    const title = (
      <Title level={3} style={{ textAlign: 'center' }}>
        <WarningTwoTone twoToneColor="#fcbe03" /> <Text strong>Are you sure?</Text>
        <WarningTwoTone twoToneColor="#fcbe03" />
      </Title>
    );

    const message =
      "Are you sure you want to delete your CV? The information contained therein will be deleted and employers will not be able to access it.";
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
      onOk: () => this.props.withdrawConsent()
    });
  }


  private async fetchData() {
    await this.setState({
      isLoading: true,
    });

    const CVData: GetCVData = await this.userService.getCVData(this.props.ownerId);

    const { notes, name, selfIntroLink, militaryService, avatarLink, desiredPosition, englishLevel, email, github, linkedin, location, phone, skype, telegram, website, startFrom, fullTime, expires } = CVData;

    const userData = {
      notes,
      name,
      selfIntroLink,
      militaryService,
      avatarLink,
      desiredPosition,
      englishLevel,
      startFrom,
      fullTime
    };

    const contactsList = {
      email,
      github,
      linkedin,
      location,
      phone,
      skype,
      telegram,
      website
    };

    await this.setState({
      contactsList: contactsList,
      userData: userData,
      expires
    });

    await this.setState({
      isLoading: false,
    });
  }

  private async submitData(data: any) {
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

    const CVData: SaveCVData = {
      selfIntroLink: this.nullifyConditional(selfIntroLink),
      militaryService,
      avatarLink,
      desiredPosition,
      englishLevel,
      name: this.nullifyConditional(name),
      notes: this.nullifyConditional(notes),
      phone: this.nullifyConditional(phone),
      email: this.nullifyConditional(email),
      skype: this.nullifyConditional(skype),
      telegram: this.nullifyConditional(telegram),
      linkedin: this.nullifyConditional(linkedin),
      location: this.nullifyConditional(location),
      github: this.nullifyConditional(github),
      website: this.nullifyConditional(website),
      startFrom: startFrom && moment(startFrom).format('YYYY-MM-DD'),
      fullTime
    };

    this.userService.saveCVData(CVData);
  }

  private async handleSave(data: any) {
    await this.submitData(data);
    await this.fetchData();
  }

  private getDataFromRefs(refs: RefObject<any>[]) {
    const values = refs
      .map(ref => {
        const data = ref.current!.getFieldsValue();
        return {
          ...data
        }
      })
      .reduce((resObj, dataObj) => Object.assign(resObj, dataObj), {});
    this.handleSave(values);
  }

  async componentDidMount() {
    await this.fetchData();
  }

  private async fillFromProfile() {
    const id = this.props.ownerId;

    const profile = await this.userService.getProfileInfo(id);

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

    const prevUserData = this.state.userData;
    const prevContacts = this.state.contactsList;

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

    await this.setState({
      userData: newUserData as UserData,
      contactsList: newContacts as Contacts,
    });
  }

  private async resetFields() {
    await this.fetchData();
  }

  private async extendCV() {
    const newExpirationDate = await this.userService.extendCV()
    this.setState({
        expires: newExpirationDate
    })
  }

  render() {
    const { isLoading, contactsList, userData } = this.state;

    const buttonStyle = {
      borderRadius: '15px',
      margin: '5px 0'
    };

    return (
      <LoadingScreen show={isLoading}>
        <Layout style={{ margin: 'auto', marginBottom: '10px', maxWidth: '960px' }}>
          <Content>
            <Card>
              <Text>CV expires <Text strong>{this.state.expires}</Text></Text>
              <Space direction="horizontal" align="start" style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                {userData && <UserDataForm ref={this.userFormRef} userData={userData} />}
                {contactsList && <ContactsForm ref={this.contactsFormRef} contactsList={contactsList} />}
              </Space>
              <Button style={buttonStyle} block type="primary" htmlType="button" onClick={() => this.fillFromProfile()}>
                Get data from profile
              </Button>
              <div style={{ display: 'flex', justifyContent: "space-between" }}>
              <Button style={{ ...buttonStyle, width: '23%' }} block type="primary" htmlType="button" onClick={() => this.getDataFromRefs([this.userFormRef, this.contactsFormRef])} icon={<SaveOutlined />}>
                Save
              </Button>
              <Button style={{ ...buttonStyle, width: '23%' }} block type="primary" danger htmlType="button" onClick={this.resetFields.bind(this)} icon={<ClearOutlined />}>
                Reset fields
              </Button>
			  <Button style={{ ...buttonStyle, width: '23%' }} block type="primary" danger htmlType="button" onClick={this.extendCV.bind(this)} icon={<FieldTimeOutlined />}>
                Extend CV
              </Button>
			  <Button style={{ ...buttonStyle, width: '23%' }} block type="primary" danger htmlType="button" onClick={this.showConfirmationModal.bind(this)} icon={<DeleteOutlined />}>
                Delete my CV
              </Button>
              </div>              
            </Card>
          </Content>
        </Layout>
      </LoadingScreen>
    );
  }
}

export default EditCV;

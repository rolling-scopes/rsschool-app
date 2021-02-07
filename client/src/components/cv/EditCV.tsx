import * as React from 'react';
import moment from 'moment';
import { Layout, Space, Button, Card } from 'antd';
import { LoadingScreen } from 'components/LoadingScreen';
import { ContactsForm, UserDataForm } from './forms';
import { Contacts, UserData } from '../../../../common/models/cv';
import { UserService } from 'services/user';

const { Content } = Layout;

type State = {
  isLoading: boolean;
  contactsList: Contacts | null;
  userData: UserData | null;

};

type Props = {
  ownerId: string;
  withdrawConsent: () => void;
};

class FormCV extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
    contactsList: null,
    userData: null
  };

  private userService = new UserService();

  private nullifyConditional(value: string | null) {
    return value === '' ? null : value;
  }

  private async fetchData() {
    await this.setState({
      isLoading: true,
    });

    const CVData = await this.userService.getCVData(this.props.ownerId);

    const { notes, name, selfIntroLink, militaryService, avatarLink, desiredPosition, englishLevel, email, github, linkedin, location, phone, skype, telegram, website, startFrom, fullTime } = CVData;

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
      userData: userData
    });

    await this.setState({
      isLoading: false,
    });
  }

  private async submitData(dataSource: { type: 'contacts' | 'userData', data: any }) {
    const { data, type } = dataSource;
    const { userData, contactsList } = this.state;
    const { notes: cvNotes, name: cvName, selfIntroLink, militaryService, avatarLink, desiredPosition, englishLevel, startFrom, fullTime } = userData!;
    const { email, github, linkedin, location, phone, skype, telegram, website } = contactsList!;

    switch (type) {
      case 'contacts': {
        const {
          email,
          github,
          linkedin,
          location,
          phone,
          skype,
          telegram,
          website
        } = data;

        await this.userService.saveCVData(this.props.ownerId, {
          selfIntroLink,
          militaryService,
          avatarLink,
          desiredPosition,
          englishLevel,
          cvEmail: this.nullifyConditional(email),
          cvGithub: this.nullifyConditional(github),
          cvLinkedin: this.nullifyConditional(linkedin),
          cvLocation: this.nullifyConditional(location),
          cvPhone: this.nullifyConditional(phone),
          cvSkype: this.nullifyConditional(skype),
          cvTelegram: this.nullifyConditional(telegram),
          cvWebsite: this.nullifyConditional(website),
          cvNotes,
          cvName,
          startFrom,
          fullTime
        });
      }
        break;

      case 'userData': {
        const {
          avatarLink,
          desiredPosition,
          englishLevel,
          militaryService,
          name: cvName,
          notes: cvNotes,
          selfIntroLink,
          startFrom: startFromRaw,
          fullTime
        } = data;

        const startFrom = startFromRaw ? moment(startFromRaw).format('YYYY.MM.DD') : null;

        await this.userService.saveCVData(this.props.ownerId, {
          selfIntroLink,
          militaryService,
          desiredPosition,
          englishLevel,
          avatarLink,
          cvEmail: this.nullifyConditional(email),
          cvGithub: this.nullifyConditional(github),
          cvLinkedin: this.nullifyConditional(linkedin),
          cvLocation: this.nullifyConditional(location),
          cvPhone: this.nullifyConditional(phone),
          cvSkype: this.nullifyConditional(skype),
          cvTelegram: this.nullifyConditional(telegram),
          cvWebsite: this.nullifyConditional(website),
          cvNotes,
          cvName,
          startFrom,
          fullTime
        });
      }
    }
  }

  private async handleSave(data: any) {
    await this.submitData(data);
    await this.fetchData();
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

  render() {
    const { isLoading, contactsList, userData } = this.state;
    const { withdrawConsent } = this.props;

    const buttonStyle = {
      borderRadius: '15px',
      margin: '10px 0'
    };

    return (
      <LoadingScreen show={isLoading}>
        <Layout style={{ margin: 'auto', marginBottom: '10px', maxWidth: '960px' }}>
          <Content>
            <Card>
              <Button style={buttonStyle} block type="primary" htmlType="button" onClick={() => this.fillFromProfile()}>
                Get data from profile
            </Button>
              <Button style={buttonStyle} block type="primary" danger htmlType="button" onClick={withdrawConsent}>
                Withdraw consent
            </Button>
              <Space direction="horizontal" align="start" style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                {userData && <UserDataForm userData={userData} handleFunc={this.handleSave.bind(this)} />}
                {contactsList && <ContactsForm contactsList={contactsList} handleFunc={this.handleSave.bind(this)} />}
              </Space>
            </Card>
          </Content>
        </Layout>
      </LoadingScreen>
    );
  }
}

export default FormCV;

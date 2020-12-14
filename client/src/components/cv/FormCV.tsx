import * as React from 'react';
import { Layout, Space, Button } from 'antd';
import { LoadingScreen } from 'components/LoadingScreen';
import { ContactsForm, EducationHistoryForm, EmploymentHistoryForm, UserDataForm } from './forms';
import { Contacts, UserData, EducationRecord, EmploymentRecord, EnglishLevel } from '../../../../common/models/cv';
import { UserService } from 'services/user';

import { mockContactsList, mockUserData, educationHistory, employmentHistory } from 'pages/cv/mockData';

const { Content } = Layout;

type State = {
  isLoading: boolean;
  contactsList: Contacts | null;
  userData: UserData | null;
  educationHistory: EducationRecord[] | null;
  employmentHistory: EmploymentRecord[] | null;
};

type Props = {
  ownerId: string;
};

class FormCV extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
    contactsList: null,
    userData: null,
    educationHistory: null,
    employmentHistory: null,
  };

  private userService = new UserService();

  private async fetchData() {
    await this.setState({
      isLoading: true,
    });

    await this.setState({
      contactsList: mockContactsList,
      userData: mockUserData as UserData,
      educationHistory: educationHistory,
      employmentHistory: employmentHistory,
    });

    await this.setState({
      isLoading: false,
    });
  }

  private handleSave(data: any) {
    console.log(data);
  }

  async componentDidMount() {
    await this.fetchData();
  }

  private async fillFromProfile() {
    const id = this.props.ownerId;

    const profile = await this.userService.getProfileInfo(id);

    const name = profile.generalInfo?.name ?? null;
    const englishLevel = (profile.generalInfo?.englishLevel as EnglishLevel) || null;
    const notes = profile.generalInfo?.aboutMyself ?? null;
    const location = profile.generalInfo?.location
      ? `${profile.generalInfo.location.cityName}, ${profile.generalInfo.location.countryName}`
      : null;
    const educationHistory = profile.generalInfo?.educationHistory ?? null;

    const phone = profile.contacts?.phone ?? null;
    const email = profile.contacts?.email ?? null;
    const skype = profile.contacts?.skype ?? null;
    const telegram = profile.contacts?.telegram ?? null;
    const linkedin = profile.contacts?.linkedIn ?? null;

    const prevUserData = this.state.userData;
    const prevContacts = this.state.contactsList;

    let newEducationHistory;

    if (educationHistory.length) {
      newEducationHistory = educationHistory.map(
        (record: { university: string; graduationYear: string; faculty: string }) => {
          const { university, graduationYear, faculty } = record;
          return {
            organization: university,
            startYear: 1970,
            finishYear: Number(graduationYear),
            education: faculty,
          };
        },
      );
    } else {
      //newEducationHistory = null;
      newEducationHistory = [
        {
          organization: 'university',
          startYear: 1970,
          finishYear: 2020,
          education: 'faculty',
        },
      ];
    }

    const newUserData = {
      ...prevUserData,
      name,
      englishLevel,
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

    if (newEducationHistory) await this.setState({ educationHistory: newEducationHistory });
  }

  render() {
    const { isLoading, contactsList, userData, educationHistory, employmentHistory } = this.state;

    return (
      <LoadingScreen show={isLoading}>
        <Layout style={{ paddingTop: '30px', margin: 'auto', maxWidth: '960px' }}>
          <Content>
            <Button type="primary" htmlType="button" onClick={() => this.fillFromProfile()}>
              Get data from profile
            </Button>
            <Space direction="vertical" style={{ width: '100%' }}>
              {userData && <UserDataForm userData={userData} handleFunc={this.handleSave} />}
              {contactsList && <ContactsForm contactsList={contactsList} handleFunc={this.handleSave} />}
              {educationHistory && (
                <EducationHistoryForm educationHistory={educationHistory} handleFunc={this.handleSave} />
              )}
              {employmentHistory && (
                <EmploymentHistoryForm employmentHistory={employmentHistory} handleFunc={this.handleSave} />
              )}
            </Space>
          </Content>
        </Layout>
      </LoadingScreen>
    );
  }
}

export default FormCV;

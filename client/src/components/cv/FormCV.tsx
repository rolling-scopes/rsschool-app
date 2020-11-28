import * as React from 'react';
import { Layout, Space } from 'antd';
import { LoadingScreen } from 'components/LoadingScreen';
import { ContactsForm, EducationHistoryForm, EmploymentHistoryForm, UserDataForm } from './forms';
import { Contact, UserData, EducationRecord, EmploymentRecord } from '../../../../common/models/cv';

import { mockContactsList, mockUserData, educationHistory, employmentHistory } from 'pages/cv/mockData';

const { Content } = Layout;

type State = {
  isLoading: boolean;
  contactsList: Contact[] | null;
  userData: UserData | null;
  educationHistory: EducationRecord[] | null;
  employmentHistory: EmploymentRecord[] | null;
};

class FormCV extends React.Component<State> {

  state: State = {
    isLoading: false,
    contactsList: null,
    userData: null,
    educationHistory: null,
    employmentHistory: null
  }

  private async fetchData() {
    await this.setState({
      isLoading: true
    });

    await this.setState({
      contactsList: mockContactsList,
      userData: mockUserData,
      educationHistory: educationHistory,
      employmentHistory: employmentHistory
    });

    await this.setState({
      isLoading: false
    });
  }

  private handleSave(data: any) {
    console.log(data);
  }

  async componentDidMount() {
    await this.fetchData();
  }

  render() {
    const {
      isLoading,
      contactsList,
      userData,
      educationHistory,
      employmentHistory
    } = this.state;

    return (
      <LoadingScreen show={isLoading}>
        <Layout style={{ paddingTop: '30px', margin: 'auto', maxWidth: '960px' }}>
          <Content>
            <Space direction="vertical" style={{ width: '100%' }}>
              {userData && <UserDataForm userData={userData} handleFunc={this.handleSave} />}
              {contactsList && <ContactsForm contactsList={contactsList} handleFunc={this.handleSave} />}
              {educationHistory && <EducationHistoryForm educationHistory={educationHistory} handleFunc={this.handleSave} />}
              {employmentHistory && <EmploymentHistoryForm employmentHistory={employmentHistory} handleFunc={this.handleSave} />}
            </Space>
          </Content>
        </Layout>
      </LoadingScreen>
    );
  }

}

export default FormCV;

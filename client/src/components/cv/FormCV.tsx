import * as React from 'react';
import { ContactsForm, EducationHistoryForm, EmploymentHistoryForm, UserDataForm } from './forms';
import { Contact, EducationRecord, EmploymentRecord, UserData } from '../../../../common/models/cv';

type Props = {
  cvData: {
    contactsList: Contact[],
    userData: UserData,
    educationHistory: EducationRecord[],
    employmentHistory: EmploymentRecord[]
  }
};

function FormCV(props: Props) {
  const {
    cvData: {
      contactsList,
      userData,
      educationHistory,
      employmentHistory
    }
  } = props;

  return (
    <>
      <UserDataForm userData={userData} />
      <ContactsForm contactsList={contactsList} />
      <EducationHistoryForm educationHistory={educationHistory} />
      <EmploymentHistoryForm employmentHistory={employmentHistory} />
    </>
  );

}

export default FormCV;

import * as React from 'react';
import { Form, Input, Select, DatePicker, Space, Divider } from 'antd';
import { Contact, EducationRecord, EmploymentRecord } from '../../../../common/models/cv';
import moment from 'moment';

const { Item } = Form;
const { Option } = Select;
const { RangePicker } = DatePicker;

type Props = {
  cvData: {
    contactsList: Contact[],
    userData: {
      name: string,
      desiredPosition: string,
      selfIntroLink: string,
      englishLevel: any,
      militaryService: any
    },
    notes: string,
    educationHistory: EducationRecord[],
    employmentHistory: EmploymentRecord[]
  }
};

function FormCV(props: Props) {
  const {
    cvData: {
      contactsList,
      userData: {
        name,
        desiredPosition,
        selfIntroLink,
        englishLevel,
        militaryService
      },
      notes,
      educationHistory,
      employmentHistory
    }
  } = props;

  return (
    <>
      <Form name='userData'>
        <Item label='Name' name='name' initialValue={name}>
          <Input />
        </Item>
        <Item label='Desired position' name='desiredPosition' initialValue={desiredPosition}>
          <Input />
        </Item>
        <Item label='Self introduction video' name='selfIntroLink' initialValue={selfIntroLink}>
          <Input />
        </Item>
        <Item label='Select your English level' name='englishLevel' initialValue={englishLevel}>
          <Select>
            <Option value='a0'>A0</Option>
            <Option value='a1'>A1</Option>
            <Option value='a1+'>A1+</Option>
            <Option value='a2'>A2</Option>
            <Option value='a2+'>A2+</Option>
            <Option value='b1'>B1</Option>
            <Option value='b1+'>B1+</Option>
            <Option value='b2'>B2</Option>
            <Option value='b2+'>B2+</Option>
            <Option value='c1'>C1</Option>
            <Option value='c1+'>C1+</Option>
            <Option value='c2'>C2</Option>
          </Select>
        </Item>
        <Item label='Military service' name='militaryService' initialValue={militaryService}>
          <Select>
            <Option value='served'>Served</Option>
            <Option value='liable'>Liable</Option>
            <Option value='notLiable'>Not liable</Option>
          </Select>
        </Item>
        <Item label='About me' name='notes' initialValue={notes}>
          <Input.TextArea rows={4} />
        </Item>
      </Form>
      <Form name='contacts'>
        {contactsList.map(contact => {
          const { contactType, contactText } = contact;
          return (
            <Item initialValue={contactText} label={contactType} name={`contacts-${contactType}`} key={contactType}>
              <Input />
            </Item>
          )
        })}
      </Form>
      <Form name='educationHistory'>
        <Space direction='vertical' style={{width: '100%'}}>
          {educationHistory.map(((educationRecord, index) => {
            const { organization, education, startYear, finishYear } = educationRecord;
            const yearFormat = 'YYYY';
            return (
              <React.Fragment key={`edu_fg_${index}`}>
                <Item initialValue={organization} label='Organization' name={`education-${index}-${organization}`}>
                  <Input />
                </Item>
                <Item initialValue={education} label='Education' name={`education-${index}-${education}`}>
                  <Input />
                </Item>
                <Item initialValue={[moment(String(startYear), yearFormat), moment(String(finishYear), yearFormat)]} label='Education years' name={`educationYears-${index}`}>
                  <RangePicker picker='year' />
                </Item>
                <Divider />
              </React.Fragment>
            );
          }))}
        </Space>
      </Form>
      <Form name='employmentHistory'>
        {employmentHistory.map(((employmentRecord, index) => {
          const { organization, position, startYear, finishYear } = employmentRecord;
          const yearFormat = 'YYYY';
          return (
            <React.Fragment key={`empl_fg_${index}`}>
              <Item initialValue={organization} label='Organization' name={`employment-${index}-${organization}`} >
                <Input />
              </Item>
              <Item initialValue={position} label='Position' name={`employment-${index}-${position}`}>
                <Input />
              </Item>
              <Item initialValue={[moment(String(startYear), yearFormat), moment(String(finishYear), yearFormat)]} label='Work years' name={`employmentYears-${index}`}>
                <RangePicker picker='year' />
              </Item>
              <Divider />
            </React.Fragment>
          );
        }))}
      </Form>
    </>
  );

}

export default FormCV;

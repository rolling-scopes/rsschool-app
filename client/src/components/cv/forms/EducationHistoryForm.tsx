import * as React from 'react';
import moment from 'moment';
import { Form, Input, Space, Divider, DatePicker } from 'antd';
import { EducationRecord } from '../../../../../common/models/cv';

const { Item } = Form;
const { RangePicker } = DatePicker;

type Props = {
  educationHistory: EducationRecord[]
};

export default function UserDataForm(props: Props) {

  const {educationHistory} = props;

  return (
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
  );
}

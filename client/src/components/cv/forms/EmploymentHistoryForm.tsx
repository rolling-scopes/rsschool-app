import * as React from 'react';
import moment from 'moment';
import { Form, Input, Space, Divider, DatePicker } from 'antd';
import { EmploymentRecord } from '../../../../../common/models/cv';

const { Item } = Form;
const { RangePicker } = DatePicker;

type Props = {
  employmentHistory: EmploymentRecord[]
};

export default function UserDataForm(props: Props) {

  const {employmentHistory} = props;

  return (
    <Form name='employmentHistory'>
      <Space direction='vertical' style={{width: '100%'}}>
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
    </Space>
  </Form>
  );
}

import * as React from 'react';
import moment from 'moment';
import { Form, Input, Space, Divider, DatePicker, Button, message } from 'antd';
import { EmploymentRecord } from '../../../../../common/models/cv';

const { Item } = Form;
const { RangePicker } = DatePicker;

type Props = {
  employmentHistory: EmploymentRecord[];
  handleFunc: (data: any) => void;
};

export default function UserDataForm(props: Props) {

  const { employmentHistory, handleFunc } = props;

  const [ownEmploymentHistory, setOwnEmploymentHistory] = React.useState([...employmentHistory]);

  const addEmptyRecord = () => {
    const newRecord = ({
      organization: 'Organization',
      position: 'Position',
      startYear: 1970,
      finishYear: 1970
    });

    setOwnEmploymentHistory([
      ...ownEmploymentHistory,
      newRecord
    ]);
  };

  const removeRecord = (index: number): void => {
    if (index === 0 && ownEmploymentHistory.length === 1) {
      message.warn('You can\'t remove last record');
      return;
    }

    const newOwnEmploymentHistory = [...ownEmploymentHistory];

    newOwnEmploymentHistory.splice(index, 1);

    setOwnEmploymentHistory(newOwnEmploymentHistory);
  };

  const transformData = (data: {[key: string]: string | object[]}) => {
    const acc: {
        [key: string]: {
            [key: string]: string | object[];
        }
    } = {};
    Object.entries(data).forEach(([key, value]) => {
      const [, index, type] = key.split('-');
      if (!acc[index]) {
          acc[index] = {};
      }

      acc[index][type] = value;

    });
    const valuesArr = Object.values(acc);
    handleFunc(valuesArr);
  };

  const submitData = (data: {[key: string]: string}) => {
    const transformedData = transformData(data);
    handleFunc(transformedData);
  };

  return (
    <Form name='employmentHistory' onFinish={submitData}>
      <Space direction='vertical' style={{ width: '100%' }}>
        {ownEmploymentHistory.map(((employmentRecord, index) => {
          const { organization, position, startYear, finishYear } = employmentRecord;
          const yearFormat = 'YYYY';
          return (
            <React.Fragment key={`empl_fg_${index}`}>
              <Item initialValue={organization} label='Organization' name={`employment-${index}-organization`} >
                <Input />
              </Item>
              <Item initialValue={position} label='Position' name={`employment-${index}-position`}>
                <Input />
              </Item>
              <Item initialValue={[moment(String(startYear), yearFormat), moment(String(finishYear), yearFormat)]} label='Work years' name={`employment-${index}-years`}>
                <RangePicker picker='year' />
              </Item>
              <Button type='dashed' htmlType='button' onClick={() => removeRecord(index)}>Remove</Button>
              <Divider />
            </React.Fragment>
          );
        }))}
      </Space>
      <Item>
        <Button type='primary' htmlType='button' onClick={addEmptyRecord}>Add new</Button>
        <Button type='primary' htmlType='submit'>Save</Button>
      </Item>
    </Form>
  );
}

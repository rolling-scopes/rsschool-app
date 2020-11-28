import * as React from 'react';
import moment from 'moment';
import { Form, Input, Space, Divider, DatePicker, Button, message } from 'antd';
import { EducationRecord } from '../../../../../common/models/cv';

const { Item } = Form;
const { RangePicker } = DatePicker;

type Props = {
  educationHistory: EducationRecord[];
  handleFunc: (data: any) => void;
};

export default function UserDataForm(props: Props) {

  const { educationHistory, handleFunc } = props;

  const [ownEducationHistory, setOwnEducationHistory] = React.useState([...educationHistory]);

  const addEmptyRecord = () => {
    const newRecord = ({
      organization: 'Organization',
      education: 'Education',
      startYear: 1970,
      finishYear: 1970
    });

    setOwnEducationHistory([
      ...ownEducationHistory,
      newRecord
    ]);
  };

  const transformData = (data: {[key: string]: string | object[]}) => {
    const acc: {
        [key: string]: {
            [key: string]: string | object[]
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

  const removeRecord = (index: number): void => {
    if (index === 0 && ownEducationHistory.length === 1) {
      message.warn('You can\'t remove last record');
      return;
    }
    const newOwnEducationHistory = [...ownEducationHistory];

    newOwnEducationHistory.splice(index, 1);

    setOwnEducationHistory(newOwnEducationHistory);
  };


  return (
    <Form name='educationHistory' onFinish={submitData}>
      <Space direction='vertical' style={{ width: '100%' }}>
        {ownEducationHistory.map(((educationRecord, index) => {
          const { organization, education, startYear, finishYear } = educationRecord;
          const yearFormat = 'YYYY';
          return (
            <React.Fragment key={`edu_fg_${index}`}>
              <Item initialValue={organization} label='Organization' name={`education-${index}-organization`}>
                <Input />
              </Item>
              <Item initialValue={education} label='Education' name={`education-${index}-education`}>
                <Input />
              </Item>
              <Item initialValue={[moment(String(startYear), yearFormat), moment(String(finishYear), yearFormat)]} label='Education years' name={`education-${index}-years`}>
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

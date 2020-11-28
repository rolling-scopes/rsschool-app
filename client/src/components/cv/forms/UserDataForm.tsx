import * as React from 'react';
import { Button, Form, Input, Select } from 'antd';
import { UserData } from '../../../../../common/models/cv';

const { Item } = Form;
const { Option } = Select;

type Props = {
  userData: UserData;
  handleFunc: (data: any) => void;
};

export default function UserDataForm(props: Props) {

  const { userData, handleFunc } = props;

  const { name, desiredPosition, selfIntroLink, englishLevel, militaryService, notes } = userData;

  return (
    <Form name='userData' onFinish={handleFunc}>
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
      <Item>
        <Button type='primary' htmlType='submit'>Save</Button>
      </Item>
    </Form>
  );
}

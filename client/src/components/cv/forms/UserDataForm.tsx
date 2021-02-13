import * as React from 'react';
import moment from 'moment';
import { Form, Input, Select, DatePicker, Checkbox } from 'antd';
import { UserData } from '../../../../../common/models/cv';
import FormCV from '../FormCV';

const { Item } = Form;
const { Option } = Select;
const { TextArea } = Input;

type Props = {
    userData: UserData;
    handleFunc: (data: any) => void;
};

export default function UserDataForm(props: Props) {
    const { userData, handleFunc } = props;

    const { avatarLink, name, desiredPosition, selfIntroLink, englishLevel, militaryService, notes } = userData;

    const startFrom = userData.startFrom ? moment(userData.startFrom, 'YYYY.MM.DD') : undefined;
    const fullTime = userData.fullTime ?? false;

    const formValues = {
        avatarLink,
        name,
        desiredPosition,
        selfIntroLink,
        englishLevel,
        militaryService,
        notes,
        startFrom,
        fullTime
    };

    const content = (
        <>
            <Item label="Name" wrapperCol={{span: 24}} labelCol={{span: 24}} name="name" rules={[{ required: true, max: 100, whitespace: false }]}>
                <Input placeholder="Enter your name" />
            </Item>
            <Item label="Desired position" wrapperCol={{span: 24}} labelCol={{span: 24}} name="desiredPosition" rules={[{ required: true, max: 100, whitespace: false }]}>
                <Input placeholder="Enter desired position" />
            </Item>
            <Item label="Self introduction video" wrapperCol={{span: 24}} labelCol={{span: 24}} name="selfIntroLink" rules={[{ max: 300, whitespace: false }]}>
                <Input placeholder="Link to video with self introduction" />
            </Item>
            <Item label="Link to avatar" wrapperCol={{span: 24}} labelCol={{span: 24}} name="avatarLink" rules={[{ max: 300, whitespace: false }]}>
                <Input placeholder="Link to image" />
            </Item>
            <Item label="Select your English level" wrapperCol={{span: 24}} labelCol={{span: 24}} name="englishLevel" rules={[{ required: true }]}>
                <Select placeholder="Not selected yet">
                    <Option value="a0">A0</Option>
                    <Option value="a1">A1</Option>
                    <Option value="a1+">A1+</Option>
                    <Option value="a2">A2</Option>
                    <Option value="a2+">A2+</Option>
                    <Option value="b1">B1</Option>
                    <Option value="b1+">B1+</Option>
                    <Option value="b2">B2</Option>
                    <Option value="b2+">B2+</Option>
                    <Option value="c1">C1</Option>
                    <Option value="c1+">C1+</Option>
                    <Option value="c2">C2</Option>
                </Select>
            </Item>
            <Item label="Military service" wrapperCol={{span: 24}} labelCol={{span: 24}} name="militaryService">
                <Select placeholder="Not selected yet">
                    <Option value="served">Served</Option>
                    <Option value="liable">Liable</Option>
                    <Option value="notLiable">Not liable</Option>
                </Select>
            </Item>
            <Item label="Ready to start work from" wrapperCol={{span: 24}} labelCol={{span: 24}} name="startFrom">
                <DatePicker placeholder="Not selected yet" picker="date" />
            </Item>
            <Item label="Ready to work full time" colon={false} name="fullTime" valuePropName="checked">
                <Checkbox />
            </Item>
            <Item label="About me" wrapperCol={{span: 24}} labelCol={{span: 24}} name="notes" rules={[{ required: true, max: 1000, min: 30, whitespace: false }]}>
                <TextArea rows={4} placeholder="Short info about you (30-1000 symbols)" />
            </Item>
        </>
    )

    return (
        <FormCV name="userData" title="General info" content={content} submitFunc={handleFunc} data={formValues} />
    );
}
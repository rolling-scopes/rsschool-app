import * as React from 'react';
import moment from 'moment';
import { Form, Input, Select, DatePicker, Checkbox, Card } from 'antd';
import { UserData } from '../../../../../common/models/cv';
import { ENGLISH_LEVELS } from '../../../services/reference-data/english';

const { Item } = Form;
const { Option } = Select;
const { TextArea } = Input;

type Props = {
  userData: UserData;
};

const UserDataForm = React.forwardRef((props: Props, ref: any) => {
  const { userData } = props;

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
    fullTime,
  };

  const [form] = Form.useForm();

  React.useEffect(() => {
    form.setFieldsValue(formValues);
  }, [formValues]);

  const itemStyle = {
    maxWidth: '314px',
  };

  return (
    <Card title="General info">
      <Form form={form} ref={ref} name="userData">
        <Item
          style={itemStyle}
          label="Name"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="name"
          rules={[{ required: true, max: 100, whitespace: false }]}
        >
          <Input placeholder="Enter your name" />
        </Item>
        <Item
          style={itemStyle}
          label="Desired position"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="desiredPosition"
          rules={[{ required: true, max: 100, whitespace: false }]}
        >
          <Input placeholder="Enter desired position" />
        </Item>
        <Item
          style={itemStyle}
          label="Self introduction video"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="selfIntroLink"
          rules={[{ max: 300, whitespace: false }]}
        >
          <Input placeholder="Link to video with self introduction" />
        </Item>
        <Item
          style={itemStyle}
          label="Link to avatar"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="avatarLink"
          rules={[{ max: 300, whitespace: false }]}
        >
          <Input placeholder="Link to image" />
        </Item>
        <Item
          style={itemStyle}
          label="Select your English level"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="englishLevel"
          rules={[{ required: true }]}
        >
          <Select placeholder="Not selected yet">
            {ENGLISH_LEVELS.map((level, idx) => (
              <Option value={level} key={idx}>
                {level}
              </Option>
            ))}
          </Select>
        </Item>
        <Item
          style={itemStyle}
          label="Military service"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="militaryService"
        >
          <Select placeholder="Not selected yet">
            <Option value="served">Served</Option>
            <Option value="liable">Liable</Option>
            <Option value="notLiable">Not liable</Option>
          </Select>
        </Item>
        <Item
          style={itemStyle}
          label="Ready to start work from"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="startFrom"
        >
          <DatePicker
            placeholder="Not selected yet"
            picker="date"
            disabledDate={currDate => currDate.valueOf() < moment().subtract(1, 'days').valueOf()}
          />
        </Item>
        <Item style={itemStyle} label="Ready to work full time" colon={false} name="fullTime" valuePropName="checked">
          <Checkbox />
        </Item>
        <Item
          style={itemStyle}
          label="About me"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="notes"
          rules={[{ required: true, max: 1000, min: 30, whitespace: false }]}
        >
          <TextArea rows={4} placeholder="Short info about you (30-1000 symbols)" />
        </Item>
      </Form>
    </Card>
  );
});

export default UserDataForm;

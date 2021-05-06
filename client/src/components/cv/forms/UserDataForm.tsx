import * as React from 'react';
import moment from 'moment';
import { Form, Input, Select, DatePicker, Checkbox, Card } from 'antd';
import { UserData } from '../../../../../common/models/cv';
import { ENGLISH_LEVELS } from '../../../services/reference-data/english';
import { Rule } from 'rc-field-form/lib/interface';

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

  const validationMessages = {
    required: "Field can't be empty",
    min: (length: number): string => `Mininal text length is ${length}`,
    max: (length: number): string => `Maximal text length is ${length}`,
    whitespace: "Field can't contain only whitespaces",
  };

  const validationRules: {
    [key: string]: Rule[];
  } = {
    name: [
      {
        required: true,
        message: validationMessages.required,
      },
      {
        max: 100,
        message: validationMessages.max(100),
      },
      {
        whitespace: true,
        message: validationMessages.whitespace,
      },
    ],
    desiredPosition: [
      {
        max: 300,
        message: validationMessages.max(300),
      },
      {
        whitespace: true,
        message: validationMessages.whitespace,
      },
    ],
    selfIntroLink: [
      {
        max: 300,
        message: validationMessages.max(300),
      },
      {
        whitespace: true,
        message: validationMessages.whitespace,
      },
    ],
    avatarLink: [
      {
        max: 300,
        message: validationMessages.max(300),
      },
      {
        whitespace: true,
        message: validationMessages.whitespace,
      },
    ],
    englishLevel: [
      {
        required: true,
        message: validationMessages.required,
      },
    ],
    militaryService: [],
    startFrom: [],
    notes: [
      {
        required: true,
        message: validationMessages.required,
      },
      {
        max: 100,
        message: validationMessages.max(100),
      },
      {
        min: 30,
        message: validationMessages.min(30),
      },
      {
        whitespace: true,
        message: validationMessages.whitespace,
      },
    ],
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
          rules={[...validationRules['name']]}
        >
          <Input placeholder="Enter your name" />
        </Item>
        <Item
          style={itemStyle}
          label="Desired position"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="desiredPosition"
          rules={[...validationRules['desiredPosition']]}
        >
          <Input placeholder="Enter desired position" />
        </Item>
        <Item
          style={itemStyle}
          label="Self introduction video"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="selfIntroLink"
          rules={[...validationRules['selfIntroLink']]}
        >
          <Input placeholder="Link to video with self introduction" />
        </Item>
        <Item
          style={itemStyle}
          label="Link to avatar"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="avatarLink"
          rules={[...validationRules['avatarLink']]}
        >
          <Input placeholder="Link to image" />
        </Item>
        <Item
          style={itemStyle}
          label="Select your English level"
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 24 }}
          name="englishLevel"
          rules={[...validationRules['englishLevel']]}
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
          rules={[...validationRules['militaryService']]}
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
          rules={[...validationRules['startFrom']]}
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
          rules={[...validationRules['notes']]}
        >
          <TextArea rows={4} placeholder="Short info about you (30-1000 symbols)" />
        </Item>
      </Form>
    </Card>
  );
});

export default UserDataForm;

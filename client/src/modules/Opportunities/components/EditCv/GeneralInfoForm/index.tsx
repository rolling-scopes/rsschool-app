import { forwardRef, useEffect, ForwardedRef } from 'react';
import moment from 'moment';
import { Form, Input, Select, DatePicker, Checkbox, Card, FormInstance, Typography, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { UserData } from 'modules/Opportunities/models';
import { ENGLISH_LEVELS } from 'data/english';
import { userDataValidationRules as validationRules } from '../form-validation';

const { Item } = Form;
const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const LabelWithTooltip = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <Text>
    {label}{' '}
    <Tooltip title={tooltip}>
      <InfoCircleOutlined style={{ fontSize: 12, opacity: 0.7 }} />
    </Tooltip>
  </Text>
);

type Props = {
  userData: UserData;
};

export const GeneralInfoForm = forwardRef((props: Props, ref: ForwardedRef<FormInstance>) => {
  const { userData } = props;

  const { avatarLink, name, desiredPosition, selfIntroLink, englishLevel, militaryService, notes, locations } =
    userData;

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
    locations,
  };

  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(formValues);
    form.validateFields();
  }, [userData]);

  const inputStyle = {
    maxWidth: '400px',
  };

  return (
    <Card title={<Text strong>General info</Text>} style={{ width: '70vw', marginBottom: '20px' }}>
      <Form
        form={form}
        ref={ref}
        name="userData"
        labelCol={{ span: 9 }}
        wrapperCol={{ span: 10 }}
        style={{ width: '100%' }}
      >
        <Item label="Name" name="name" rules={[...validationRules['name']]}>
          <Input style={inputStyle} placeholder="Enter your name" />
        </Item>
        <Item label="Desired position" name="desiredPosition" rules={[...validationRules['desiredPosition']]}>
          <Input style={inputStyle} placeholder="Enter desired position" />
        </Item>
        <Item
          label={<LabelWithTooltip label="Locations" tooltip="Up to 3, comma-separated" />}
          name="locations"
          rules={[...validationRules['locations']]}
        >
          <Input style={inputStyle} placeholder="Enter locations" />
        </Item>
        <Item label="Select your English level" name="englishLevel" rules={[...validationRules['englishLevel']]}>
          <Select style={inputStyle} placeholder="Not selected yet">
            {ENGLISH_LEVELS.map((level, idx) => (
              <Option value={level} key={idx}>
                {level}
              </Option>
            ))}
          </Select>
        </Item>
        <Item label="Military service" name="militaryService" rules={[...validationRules['militaryService']]}>
          <Select style={inputStyle} placeholder="Not selected yet">
            <Option value="served">Served</Option>
            <Option value="liable">Liable</Option>
            <Option value="notLiable">Not liable</Option>
          </Select>
        </Item>
        <Item label="Ready to start work from" name="startFrom" rules={[...validationRules['startFrom']]}>
          <DatePicker
            style={inputStyle}
            placeholder="Not selected yet"
            picker="date"
            disabledDate={currDate => currDate.valueOf() < moment().subtract(1, 'days').valueOf()}
          />
        </Item>
        <Item label="Ready to work full time" colon={false} name="fullTime" valuePropName="checked">
          <Checkbox />
        </Item>
        <Item
          label={<LabelWithTooltip label="Photo" tooltip="Direct link to the image" />}
          name="avatarLink"
          rules={[...validationRules['avatarLink']]}
        >
          <Input style={inputStyle} placeholder="Enter link to your photo" />
        </Item>
        <Item label="Self introduction video" name="selfIntroLink" rules={[...validationRules['selfIntroLink']]}>
          <Input style={inputStyle} placeholder="Link to video with self introduction" />
        </Item>
        <Item label="About me" name="notes" rules={[...validationRules['notes']]}>
          <TextArea
            showCount
            style={inputStyle}
            maxLength={1500}
            rows={4}
            placeholder="Short info about you (50-1500 symbols)"
          />
        </Item>
      </Form>
    </Card>
  );
});

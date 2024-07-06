import { Checkbox, Form, Input, DatePicker, Space, Button, FormInstance, Divider } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useState } from 'react';
import EmploymentHistoryDisplayItem from './EmploymentHistoryDisplayItem';
import { EmploymentRecordFormItem } from '../EmploymentCard';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { LocationSelect } from 'components/Forms';
import { Location } from 'api';

type EmploymentHistoryFormItemPros = {
  name: number;
  restField: { fieldKey?: number | undefined };
  remove: (index: number | number[]) => void;
  form: FormInstance<{ employmentHistory: EmploymentRecordFormItem[] }>;
};

const EmploymentHistoryFormItem = ({ name, restField, remove, form }: EmploymentHistoryFormItemPros) => {
  const { title, dateFrom, dateTo, toPresent, companyName, location } =
    form.getFieldValue(['employmentHistory', name]) ?? {};
  const [isToPresent, setToPresent] = useState<boolean>(toPresent);
  const [isDateToRequired, setIsDateToRequired] = useState<boolean>(!toPresent);
  const [locationSelectValue, setLocationSelectValue] = useState(location);

  const handleLocationChange = (value: Location | null) => {
    setLocationSelectValue(value);
  };

  const onCheckboxChange = (e: CheckboxChangeEvent) => {
    const toPresentValue = e.target.checked;
    setToPresent(toPresentValue);
    setIsDateToRequired(!toPresentValue);
    const validateFields =[
      ...(dateFrom ? [['employmentHistory', name, 'dateFrom']] : []),
      ...(!dateTo ? [['employmentHistory', name, 'dateTo']] : []),
    ]
    form.validateFields(validateFields);
  };

  return (
    <>
      <Space direction="vertical">
        <EmploymentHistoryDisplayItem
          employmentRecord={{
            title,
            dateFrom,
            dateTo,
            toPresent: isToPresent,
            companyName,
          }}
        />
        <Form.Item
          {...restField}
          name={[name, 'title']}
          label="Position title"
          rules={[{ required: true, message: '${label} is required' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          {...restField}
          name={[name, 'companyName']}
          label="Company name"
          rules={[{ required: true, message: '${label} is required' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item {...restField} name={[name, 'toPresent']} valuePropName="checked">
          <Checkbox onChange={onCheckboxChange}>I am currently working in this role</Checkbox>
        </Form.Item>
        <Form.Item
          {...restField}
          name={[name, 'dateFrom']}
          label="Date From"
          rules={[{ required: true, message: '${label} is required' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || isToPresent || getFieldValue(['employmentHistory', name, 'dateTo']) > value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Date From must be less than Date To!'));
              },
            }),]}
        >
          <DatePicker />
        </Form.Item>
        <Form.Item
          {...restField}
          name={[name, 'dateTo']}
          label="Date To"
          rules={[
            { required: isDateToRequired, message: '${label} is required' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue(['employmentHistory', name, 'dateFrom']) < value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Date To must be greater than Date From!'));
              },
            }),
          ]}
        >
          <DatePicker disabled={isToPresent} />
        </Form.Item>
        <Form.Item {...restField} name={[name, 'location']} label="Office location">
          <LocationSelect style={{ flex: 1 }} onChange={handleLocationChange} location={locationSelectValue} />
        </Form.Item>
        <Button size="small" type="dashed" onClick={() => remove(name)}>
          <DeleteOutlined /> Delete
        </Button>
      </Space>
      <Divider />
    </>
  );
};

export default EmploymentHistoryFormItem;

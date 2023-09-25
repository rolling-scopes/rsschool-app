import { Checkbox, Form, Input, DatePicker, Space, Button, FormInstance, Divider } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useState } from 'react';
import EmploymentHistoryDisplayItem from './EmploymentHistoryDisplayItem';
import { EmploymentRecordFormItem } from '../EmploymentCard';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

type EmploymentHistoryItemFormPros = {
  name: number;
  restField: { fieldKey?: number | undefined };
  remove: (index: number | number[]) => void;
  form: FormInstance<{ employmentHistory: EmploymentRecordFormItem[] }>;
};

const EmploymentHistoryItemForm = ({ name, restField, remove, form }: EmploymentHistoryItemFormPros) => {
  const { title, dateFrom, dateTo, toPresent, companyName } = form.getFieldValue(['employmentHistory', name]) ?? {};
  const [isToPresent, setToPresent] = useState<boolean>(toPresent);
  const [isDateToRequired, setIsDateToRequired] = useState<boolean>(!toPresent);

  const onCheckboxChange = (e: CheckboxChangeEvent) => {
    const toPresentValue = e.target.checked;
    setToPresent(toPresentValue);
    setIsDateToRequired(!toPresentValue);
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
        <Form.Item {...restField} name={[name, 'title']} label="Position title" rules={[{ required: true, message: '${label} is required' }]}>
          <Input />
        </Form.Item>
        <Form.Item {...restField} name={[name, 'companyName']} label="Company name" rules={[{ required: true, message: '${label} is required' }]}>
          <Input />
        </Form.Item>
        <Form.Item {...restField} name={[name, 'toPresent']} valuePropName="checked">
          <Checkbox onChange={onCheckboxChange}>I am currently working in this role</Checkbox>
        </Form.Item>
        <Form.Item {...restField} name={[name, 'dateFrom']} label="Date From" rules={[{ required: true, message: '${label} is required' }]}>
          <DatePicker />
        </Form.Item>
        <Form.Item {...restField} name={[name, 'dateTo']} label="Date To" rules={[{ required: isDateToRequired, message: '${label} is required' }]}>
          <DatePicker disabled={isToPresent} />
        </Form.Item>
        <Form.Item {...restField} name={[name, 'officeLocation']} label="Office location">
          <Input />
        </Form.Item>
        <Button size="small" type="dashed" onClick={() => remove(name)}>
          <DeleteOutlined /> Delete
        </Button>
      </Space>
      <Divider />
    </>
  );
};

export default EmploymentHistoryItemForm;

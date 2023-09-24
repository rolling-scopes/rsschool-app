import { Checkbox, Form, Input, DatePicker, Space, Button, FormInstance, Divider } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useState } from 'react';
import EmploymentHistoryDisplayItem from './EmploymentHistoryDisplayItem';
import { EmploymentRecordFormItem } from '../EmploymentCard';

type EmploymentHistoryItemFormPros = {
  name: number;
  restField: { fieldKey?: number | undefined };
  remove: (index: number | number[]) => void;
  form: FormInstance<{ employmentHistory: EmploymentRecordFormItem[] }>;
};

const EmploymentHistoryItemForm = ({ name, restField, remove, form }: EmploymentHistoryItemFormPros) => {
  const { title, dateFrom, dateTo, toPresent, companyName } = form.getFieldValue(['employmentHistory', name]) ?? {};
  const [isToPresent, setToPresent] = useState<boolean>(toPresent);

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
        <Form.Item {...restField} name={[name, 'title']} label="Position title:">
          <Input />
        </Form.Item>
        <Form.Item {...restField} name={[name, 'companyName']} label="Company name:">
          <Input />
        </Form.Item>
        <Form.Item {...restField} name={[name, 'toPresent']} valuePropName="checked">
          <Checkbox onChange={e => setToPresent(e.target.checked)}>I am currently working in this role</Checkbox>
        </Form.Item>
        <Form.Item {...restField} name={[name, 'dateFrom']} label="Date From:">
          <DatePicker />
        </Form.Item>
        <Form.Item {...restField} name={[name, 'dateTo']} label="Date To:">
          <DatePicker disabled={isToPresent} />
        </Form.Item>
        <Form.Item {...restField} name={[name, 'officeLocation']} label="Office location:">
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

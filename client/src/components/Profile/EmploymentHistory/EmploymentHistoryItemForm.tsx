import { Checkbox, Form, Input, DatePicker, Space, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { EmploymentRecordDto } from 'api';
import dayjs from 'dayjs';
import { useState } from 'react';
import EmploymentHistoryDisplayItem from './EmploymentHistoryDisplayItem';

type EmploymentHistoryItemFormPros = {
  employmentRecord?: EmploymentRecordDto;
  index: number;
  handleChange: (employmentRecord: EmploymentRecordDto, index: number) => void;
  handleDelete: (index: number) => void;
};

const EmploymentHistoryItemForm = ({
  employmentRecord,
  index,
  handleChange,
  handleDelete,
}: EmploymentHistoryItemFormPros) => {
  const { title = '', toPresent = false, companyName = '', officeLocation = '' } = employmentRecord ?? {};
  const dateFrom = employmentRecord?.dateFrom ? dayjs(Number(employmentRecord?.dateFrom)) : dayjs();
  const dateTo = employmentRecord?.dateTo ? dayjs(Number(employmentRecord?.dateTo)) : dayjs();

  const [isToPresent, setToPresent] = useState<boolean>(!!toPresent);

  return (
    <Space direction="vertical">
      <EmploymentHistoryDisplayItem
        employmentRecord={{
          title,
          dateFrom: employmentRecord?.dateFrom ?? '',
          dateTo: employmentRecord?.dateTo ?? '',
          toPresent: isToPresent,
          companyName,
        }}
      />
      <Form
        layout="vertical"
        initialValues={{ title, dateFrom, dateTo, toPresent, companyName, officeLocation }}
        onValuesChange={(_, employmentRecord) => {
          handleChange(employmentRecord, index);
        }}
      >
        <Form.Item name={'title'} label="Position title:">
          <Input />
        </Form.Item>
        <Form.Item name={'companyName'} label="Company name:">
          <Input />
        </Form.Item>
        <Form.Item name={'toPresent'} valuePropName="checked">
          <Checkbox onChange={e => setToPresent(e.target.checked)}>I am currently working in this role</Checkbox>
        </Form.Item>
        <Form.Item name={'dateFrom'} label="Date From:">
          <DatePicker />
        </Form.Item>
        <Form.Item name={'dateTo'} label="Date To:">
          <DatePicker disabled={isToPresent} />
        </Form.Item>
        <Form.Item name={'officeLocation'} label="Office location:">
          <Input />
        </Form.Item>
      </Form>
      <Button size="small" type="dashed" onClick={() => handleDelete(index)}>
        <DeleteOutlined /> Delete
      </Button>
    </Space>
  );
};

export default EmploymentHistoryItemForm;

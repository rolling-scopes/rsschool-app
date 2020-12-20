import * as React from 'react';
import moment from 'moment';
import { Form, Input, Space, DatePicker, Button, Checkbox, message } from 'antd';
import { EmploymentRecord } from '../../../../../common/models/cv';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

const { Item } = Form;
const { RangePicker } = DatePicker;

type Props = {
  employmentHistory: EmploymentRecord[];
  handleFunc: (data: any) => void;
};

export default function EmploymentHistoryForm(props: Props) {
  const { employmentHistory, handleFunc } = props;
  const [form] = Form.useForm();

  const transformEmploymentHistory = (employmentRecords: EmploymentRecord[]) => {
    return employmentRecords.map(record => {
      const { organization, position, startYear, finishYear, isCurrent } = record;
      return {
        organization,
        position,
        isCurrent,
        employmentYears: [moment(startYear, 'YYYY'), moment(finishYear, 'YYYY')],
      };
    });
  };

  const setEmploymentHistoryTransformed = (fieldsData: EmploymentRecord[], transformFunc: typeof transformEmploymentHistory): void => {
    const fieldsDataTransformed = transformFunc(fieldsData);
    form.setFieldsValue({
      employmentRecords: fieldsDataTransformed
    });
  };

  React.useEffect(() => {
    setEmploymentHistoryTransformed(employmentHistory, transformEmploymentHistory);
  }, [employmentHistory]);


  const setCurrent = (e: CheckboxChangeEvent, index: number): void => {
    const nextValue = e.target.checked;

    const newEmploymentHistory = [...employmentHistory];
    newEmploymentHistory[index].isCurrent = nextValue;

    setEmploymentHistoryTransformed(newEmploymentHistory, transformEmploymentHistory);
  };

  type RmFunc = (x: number) => void;

  const removeRecord = (index: number, rm: RmFunc, length: number): void => {
    if (index === 0 && length === 1) {
      message.warn("You can't remove last record");
      return;
    }

    rm(index);
  };

  return (
    <Form
      form={form}
      initialValues={{
        employmentRecords: [
          {
            organization: 'Organization',
            position: 'Position',
            employmentYears: [moment(1970, 'YYYY'), moment(1970, 'YYYY')],
          },
        ],
      }}
      name="dynamic_form_nest_item"
      onFinish={handleFunc}
      autoComplete="off"
    >
      <Form.List name="employmentRecords">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Item
                  {...field}
                  name={[field.name, 'organization']}
                  fieldKey={[field.fieldKey, 'organization']}
                  rules={[{ max: 100 }]}
                >
                  <Input placeholder="Organization" />
                </Item>
                <Item
                  {...field}
                  name={[field.name, 'position']}
                  fieldKey={[field.fieldKey, 'position']}
                  rules={[{ required: true, max: 100 }]}
                >
                  <Input placeholder="Position" />
                </Item>
                <Item
                  {...field}
                  name={[field.name, 'employmentYears']}
                  fieldKey={[field.fieldKey, 'employmentYears']}
                  rules={[{ required: true }]}
                >
                  <RangePicker disabled={[false, employmentHistory[index].isCurrent]} picker="year" />
                </Item>
                <Item
                  {...field}
                  name={[field.name, 'isCurrent']}
                  fieldKey={[field.fieldKey, 'isCurrent']}
                  label='Current'
                >
                  <Checkbox checked={employmentHistory[index].isCurrent} onChange={(e) => setCurrent(e, index)}/>
                </Item>
                <Button type="dashed" onClick={() => removeRecord(index, remove, fields.length)}>
                  REMOVE
                </Button>
              </Space>
            ))}
            <Item>
              <Button type="dashed" onClick={() => add()} block>
                Add field
              </Button>
            </Item>
          </>
        )}
      </Form.List>
      <Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Item>
      <Item>
        <Button type="primary" htmlType="button" onClick={() => form.resetFields()}>
          Reset
        </Button>
      </Item>
    </Form>
  );
}

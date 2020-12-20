import * as React from 'react';
import moment from 'moment';
import { Form, Input, Space, DatePicker, Button, message } from 'antd';
import { EducationRecord } from '../../../../../common/models/cv';

const { Item } = Form;
const { RangePicker } = DatePicker;

type Props = {
  educationHistory: EducationRecord[];
  handleFunc: (data: any) => void;
};

export default function EducationHistoryForm(props: Props) {
  const { educationHistory, handleFunc } = props;
  const [form] = Form.useForm();

  const transformEducationHistory = (educationRecords: EducationRecord[]) => {
    return educationRecords.map(record => {
      const { organization, education, startYear, finishYear } = record;
      return {
        organization,
        education,
        educationYears: [moment(startYear, 'YYYY'), moment(finishYear, 'YYYY')],
      };
    });
  };

  const setEducationHistoryTransformed = (fieldsData: EducationRecord[], transformFunc: typeof transformEducationHistory): void => {
    const fieldsDataTransformed = transformFunc(fieldsData);
    form.setFieldsValue({
      educationRecords: fieldsDataTransformed
    });
  };

  React.useEffect(() => {
    setEducationHistoryTransformed(educationHistory, transformEducationHistory);
  }, [educationHistory]);


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
        educationRecords: [
          {
            organization: 'Organization',
            education: 'Education',
            educationYears: [moment(1970, 'YYYY'), moment(1970, 'YYYY')],
          },
        ],
      }}
      name="dynamic_form_nest_item"
      onFinish={handleFunc}
      autoComplete="off"
    >
      <Form.List name="educationRecords">
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
                  name={[field.name, 'education']}
                  fieldKey={[field.fieldKey, 'education']}
                  rules={[{ required: true, max: 100 }]}
                >
                  <Input placeholder="Education" />
                </Item>
                <Item
                  {...field}
                  name={[field.name, 'educationYears']}
                  fieldKey={[field.fieldKey, 'educationYears']}
                  rules={[{ required: true }]}
                >
                  <RangePicker picker="year" />
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

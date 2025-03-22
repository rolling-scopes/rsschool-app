import { Button, Card, Checkbox, Col, Form, FormInstance, Input, Radio, Row, Select } from 'antd';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import { FormListFieldData } from 'antd/lib';
import { EditAutoTestFormData } from './data/types';

type QuestionEditorProps = {
  field: FormListFieldData;
  form: FormInstance<EditAutoTestFormData>;
  removeQuestion: (name: number) => void;
};

const { Option } = Select;

export function QuestionEditor({ field, form, removeQuestion }: QuestionEditorProps) {
  const { key, name, ...restField } = field;
  const isMultiple = Form.useWatch(['questions', name, 'multiple'], form);
  const answersList = Form.useWatch(['questions', name, 'answers'], form) || [];
  return (
    <Card key={key} size="small">
      <Row gutter={8} align="bottom">
        <Col xs={24} sm={16}>
          <Form.Item
            {...restField}
            label={`Question ${name + 1}`}
            name={[name, 'question']}
            rules={[{ required: true, message: 'Enter question' }]}
          >
            <Input placeholder="Question" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item name={[name, 'multiple']} valuePropName="checked">
            <Checkbox>Multiple Choice</Checkbox>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={8}>
        <Col xs={24} sm={12}>
          <Form.Item label="Question Image URL" name={[name, 'questionImage']}>
            <Input placeholder="Optional image URL" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="Answers Type" name={[name, 'answersType']}>
            <Select>
              <Option value="text">Text</Option>
              <Option value="image">Image</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Form.List name={[name, 'answers']}>
        {(subFields, { add: addAnswer, remove: removeAnswer }) => (
          <>
            {subFields.map(({ key: subKey, name: subName, ...subRestField }) => (
              <Row key={subKey} gutter={4} align="top" style={{ marginBottom: 4 }}>
                {isMultiple && (
                  <Col flex="none">
                    <Form.Item {...subRestField} name={[subName, 'correct']} valuePropName="checked">
                      <Checkbox />
                    </Form.Item>
                  </Col>
                )}
                <Col flex="auto">
                  <Form.Item name={[subName, 'text']} rules={[{ required: true, message: 'Enter answer' }]}>
                    <Input placeholder="Answer" />
                  </Form.Item>
                </Col>
                <Col flex="none">
                  <Button icon={<DeleteOutlined />} danger onClick={() => removeAnswer(subName)} />
                </Col>
              </Row>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => addAnswer()} block>
                + Add Answer
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
      {!isMultiple && (
        <Form.Item
          label="Select Correct Answer"
          name={[name, 'correctIndex']}
          rules={[{ required: true, message: 'Select correct answer' }]}
        >
          <Radio.Group>
            {answersList.map((_: any, index: number) => (
              <Radio key={index} value={index}>{`Answer ${index + 1}`}</Radio>
            ))}
          </Radio.Group>
        </Form.Item>
      )}
      <Button danger onClick={() => removeQuestion(name)} style={{ marginTop: 4 }}>
        Remove Question
      </Button>
    </Card>
  );
}

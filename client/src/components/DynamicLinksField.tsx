import React from 'react';
import { Form, Input, Button } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

interface Props {
  handleChangeLinks: () => {}, 
}

const DynamicFieldSet: React.FC<Props> = ({ handleChangeLinks }) => {
  return (
    <>
      <Form.List name="links">
        {(fields, { add, remove }) => {
          return (
            <div>
              {fields.map((field, id) => (
                <Form.Item label="Link" key={id}>
                  <Form.Item  
                    {...field}
                    key={field.key}
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      {
                        whitespace: true,
                        required: true,
                        message: 'Please input link or delete this field.',
                      },
                    ]}
                    noStyle
                  >
                    <Input
                      onChange={(e) => {
                        handleChangeLinks(e);
                      }}
                    />
                  </Form.Item>
                  {fields.length >= 1 ? (
                    <MinusCircleOutlined
                      className="dynamic-delete-button"
                      style={{ margin: '0 8px' }}
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  ) : null}
                </Form.Item>
              ))}
              <Form.Item label="Add link">
                <Button
                  type="dashed"
                  block
                  onClick={() => {
                    add();
                  }}
                >
                  <PlusOutlined /> Add link
                </Button>
              </Form.Item>
            </div>
          );
        }}
      </Form.List>
    </>
  );
};
export default DynamicFieldSet;

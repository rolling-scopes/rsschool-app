import * as React from 'react';
import { Checkbox, Typography, Form } from 'antd';

export function GdprCheckbox() {
  return (
    <>
      <Typography.Paragraph>
        I hereby agree to the processing of my personal data contained in the application and sharing it with companies
        only for students employment purposes.
      </Typography.Paragraph>
      <Typography.Paragraph>
        Я согласен на обработку моих персональных данных, содержащихся в приложении, и передачу их компаниям только в
        целях трудоустройства студентов.
      </Typography.Paragraph>
      <Form.Item name="gdpr" valuePropName="checked">
        <Checkbox>I agree / Я согласен</Checkbox>
      </Form.Item>
    </>
  );
}

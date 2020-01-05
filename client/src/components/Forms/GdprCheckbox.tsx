import { Checkbox, Form, Typography } from 'antd';
import { Component, ReactNode } from 'react';
import { GetFieldDecoratorOptions } from 'antd/lib/form/Form';

type Props = {
  field: (id: string, options?: GetFieldDecoratorOptions) => (node: ReactNode) => ReactNode;
};

export class GdprCheckbox extends Component<Props> {
  render() {
    return (
      <>
        <Typography.Paragraph>
          I hereby agree to the processing of my personal data contained in the application and sharing it with
          companies only for students employment purposes.
        </Typography.Paragraph>
        <Typography.Paragraph>
          Я согласен на обработку моих персональных данных, содержащихся в приложении, и передачу их компаниям только в
          целях трудоустройства студентов.
        </Typography.Paragraph>
        <Form.Item>
          {this.props.field('gdpr', { valuePropName: 'checked' })(<Checkbox>I agree / Я согласен</Checkbox>)}
        </Form.Item>
      </>
    );
  }
}

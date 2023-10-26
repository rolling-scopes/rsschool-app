import { render, screen, fireEvent } from '@testing-library/react';
import { JsonAttributesPanel } from './JsonAttributesPanel';
import { Form } from 'antd';
import { ERROR_MESSAGES, PLACEHOLDERS } from 'modules/Tasks/constants';

const renderPanel = () => {
  render(
    <Form>
      <JsonAttributesPanel />
    </Form>,
  );
};

describe('JSON Attributes', () => {
  test('should render attributes textarea', async () => {
    renderPanel();

    const textarea = await screen.findByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveProperty('placeholder', PLACEHOLDERS.jsonAttributes);
  });

  test('should render error message on invalid JSON input', async () => {
    renderPanel();
    const invalidJson = `{ name: 'Pit' }`;

    const textarea = await screen.findByRole('textbox');
    expect(textarea).toBeInTheDocument();

    fireEvent.change(textarea, { target: { value: invalidJson } });

    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent(ERROR_MESSAGES.invalidJson);
  });
});

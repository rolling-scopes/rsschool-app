import { render, screen, fireEvent } from '@testing-library/react';
import { JsonAttributesPanel } from './JsonAttributesPanel';
import { Form } from 'antd';
import { ERROR_MESSAGES, PLACEHOLDERS } from '@client/modules/Tasks/constants';

const renderPanel = () => {
  render(
    <Form>
      <JsonAttributesPanel />
    </Form>,
  );
};

describe('JSON Attributes', () => {
  test('should render attributes textarea and validate invalid JSON', async () => {
    renderPanel();

    const textarea = await screen.findByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveProperty('placeholder', PLACEHOLDERS.jsonAttributes);

    fireEvent.change(textarea, { target: { value: `{ name: 'Pit' }` } });

    const errorMessage = await screen.findByText(ERROR_MESSAGES.invalidJson);
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent(ERROR_MESSAGES.invalidJson);
  });
});

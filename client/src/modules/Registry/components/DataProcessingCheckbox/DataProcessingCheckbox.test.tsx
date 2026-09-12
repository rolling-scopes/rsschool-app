import { render, screen } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
import { Form } from 'antd';
import { ERROR_MESSAGES } from '@client/modules/Registry/constants';
import { DataProcessingCheckbox } from './DataProcessingCheckbox';

enum Checkbox {
  notChecked,
  checked,
}

const renderCheckbox = (checked = Checkbox.notChecked) =>
  render(
    <Form initialValues={{ dataProcessing: checked }}>
      <DataProcessingCheckbox />
    </Form>,
  );

describe('DataProcessingCheckbox', () => {
  const user = setupUser();

  test('renders checked state and validates when unchecked', async () => {
    renderCheckbox(Checkbox.checked);

    const checkbox = await screen.findByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();
    expect(screen.queryByText(ERROR_MESSAGES.shouldAgree)).not.toBeInTheDocument();

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(await screen.findByText(ERROR_MESSAGES.shouldAgree)).toBeInTheDocument();
  });
});

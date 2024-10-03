import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { ERROR_MESSAGES } from 'modules/Registry/constants';
import { TermsOfServiceCheckbox } from './TermsOfServiceCheckbox';

enum Checkbox {
  notChecked,
  checked,
}

const renderCheckbox = (checked = Checkbox.notChecked) =>
  render(
    <Form initialValues={{ termsOfService: checked }}>
      <TermsOfServiceCheckbox />
    </Form>,
  );

describe('TermsOfServiceCheckbox', () => {
  const user = userEvent.setup();

  test('should render checkbox', async () => {
    renderCheckbox();

    const checkbox = await screen.findByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  test('should not render error message when checkbox is selected', async () => {
    renderCheckbox(Checkbox.checked);

    const checkbox = await screen.findByRole('checkbox');
    const errorMessage = screen.queryByText(ERROR_MESSAGES.shouldAgree);
    expect(checkbox).toBeChecked();
    expect(errorMessage).not.toBeInTheDocument();
  });

  test('should render error message when checkbox is not selected', async () => {
    renderCheckbox(Checkbox.checked);

    const checkbox = await screen.findByRole('checkbox');

    await user.click(checkbox);

    const errorMessage = await screen.findByText(ERROR_MESSAGES.shouldAgree);
    expect(checkbox).not.toBeChecked();
    expect(errorMessage).toBeInTheDocument();
  });
});

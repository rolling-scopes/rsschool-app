import { render, screen, waitFor } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
import { Button, Form } from 'antd';
import { GdprCheckbox } from './GdprCheckbox';

// GdprCheckbox renders consent text plus an antd `<Form.Item name="gdpr" valuePropName="checked">`
// wrapping a `<Checkbox>`. Form.Item injects `checked`/`onChange`, so we render it inside a real
// antd Form and toggle the checkbox like a user, asserting the submitted form value.
function renderGdprCheckbox(onFinish = vi.fn()) {
  const utils = render(
    <Form onFinish={onFinish}>
      <GdprCheckbox />
      <Button htmlType="submit">Submit</Button>
    </Form>,
  );
  return { ...utils, onFinish };
}

describe('GdprCheckbox', () => {
  it('renders consent and submits checked and unchecked values', async () => {
    const user = setupUser();
    const { onFinish } = renderGdprCheckbox();

    expect(screen.getByText(/I hereby agree to the processing of my personal data/i)).toBeInTheDocument();
    expect(screen.getByText(/Я согласен на обработку моих персональных данных/i)).toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox', { name: /I agree/i });
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    await user.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ gdpr: true }));

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    await user.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ gdpr: false }));
  });
});

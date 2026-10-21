import { render, screen, waitFor } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
import { Button, Form } from 'antd';
import { ScoreInput } from './ScoreInput';

// ScoreInput renders an antd `<Form.Item name="score">` wrapping an `<InputNumber>`.
// Form.Item injects value/onChange, so we always render it inside a real antd Form
// and drive the spinbutton like a user. A submit button lets us trigger validation.
function renderScoreInput(props: Parameters<typeof ScoreInput>[0] = {}, onFinish = vi.fn()) {
  const utils = render(
    <Form onFinish={onFinish}>
      <ScoreInput {...props} />
      <Button htmlType="submit">Submit</Button>
    </Form>,
  );
  return { ...utils, onFinish };
}

describe('ScoreInput', () => {
  it('falls back to the courseTask.maxScore when maxScore prop is absent', () => {
    renderScoreInput({ courseTask: { id: 1, maxScore: 45 } });

    expect(screen.getByLabelText('Score (Max 45 points)')).toBeInTheDocument();
  });

  it('defaults the courseTask max to 100 when its maxScore is falsy', () => {
    renderScoreInput({ courseTask: { id: 1, maxScore: 0 } });

    expect(screen.getByLabelText('Score (Max 100 points)')).toBeInTheDocument();
  });

  it('prefers the maxScore prop over the courseTask value', () => {
    renderScoreInput({ maxScore: 25, courseTask: { id: 1, maxScore: 100 } });

    expect(screen.getByLabelText('Score (Max 25 points)')).toBeInTheDocument();
  });

  it('lets the user type a score and submits it', async () => {
    const user = setupUser();
    const { onFinish } = renderScoreInput({ maxScore: 80 });

    const input = screen.getByLabelText('Score (Max 80 points)');
    await user.type(input, '42');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ score: 42 }));
  });

  it('shows a required-error and blocks submit when left empty', async () => {
    const user = setupUser();
    const { onFinish } = renderScoreInput();

    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    expect(screen.getByLabelText('Score')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText('Please enter score')).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('clamps a value typed above the configured max on blur', async () => {
    const user = setupUser();
    renderScoreInput({ maxScore: 50 });

    const input = screen.getByRole('spinbutton');
    await user.type(input, '999');
    await user.tab();

    await waitFor(() => expect(input).toHaveValue('50'));
  });

  it('clamps a negative value to the configured minimum of 0 on blur', async () => {
    const user = setupUser();
    renderScoreInput({ maxScore: 50 });

    const input = screen.getByRole('spinbutton');
    await user.type(input, '-5');
    await user.tab();

    await waitFor(() => expect(input).toHaveValue('0'));
  });
});

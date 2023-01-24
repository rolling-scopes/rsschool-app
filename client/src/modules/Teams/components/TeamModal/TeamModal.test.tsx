import { screen, render, fireEvent } from '@testing-library/react';
import TeamModal from './TeamModal';

const onSubmit = jest.fn();
const onCancel = jest.fn();

function renderModal() {
  return render(<TeamModal data={{}} onCancel={onCancel} onSubmit={onSubmit} />);
}

describe('TeamModal', () => {
  it('should call onCancel when canceling', () => {
    renderModal();
    const cancelButton = screen.getByRole('button', {
      name: /cancel/i,
    });
    fireEvent.click(cancelButton);
    expect(onCancel).toHaveBeenCalled();
  });
});

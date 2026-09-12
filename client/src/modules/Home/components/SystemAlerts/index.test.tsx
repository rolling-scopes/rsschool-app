import { render, screen } from '@testing-library/react';
import { SystemAlerts } from './';
import type { AlertDto } from '@client/api';

vi.mock('antd', () => ({
  Alert: ({ message, type }: { message: React.ReactNode; type: string }) => (
    <div role="alert" className={`ant-alert-${type}`}>
      {message}
    </div>
  ),
}));

describe('<SystemAlerts />', () => {
  it('renders no empty alerts and maps supplied alert types', () => {
    const { container, rerender } = render(<SystemAlerts alerts={[]} />);
    expect(container).toBeEmptyDOMElement();

    const alerts = [
      { text: 'First alert', type: 'info' },
      { text: 'Second alert', type: 'error' },
    ] as AlertDto[];
    rerender(<SystemAlerts alerts={alerts} />);
    expect(screen.getByText('First alert')).toBeInTheDocument();
    expect(screen.getByText('Second alert')).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(2);

    const warningAlerts = [{ text: 'Careful', type: 'warn' }] as AlertDto[];
    rerender(<SystemAlerts alerts={warningAlerts} />);
    expect(screen.getByRole('alert')).toHaveClass('ant-alert-warning');
  });
});

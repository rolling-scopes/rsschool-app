import { render, screen } from '@testing-library/react';
import { SystemAlerts } from './';
import type { AlertDto } from '@client/api';

describe('<SystemAlerts />', () => {
  it('renders nothing when there are no alerts', () => {
    const { container } = render(<SystemAlerts alerts={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders one antd alert per item', () => {
    const alerts = [
      { text: 'First alert', type: 'info' },
      { text: 'Second alert', type: 'error' },
    ] as AlertDto[];
    render(<SystemAlerts alerts={alerts} />);
    expect(screen.getByText('First alert')).toBeInTheDocument();
    expect(screen.getByText('Second alert')).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });

  it('maps the "warn" type to antd "warning"', () => {
    const alerts = [{ text: 'Careful', type: 'warn' }] as AlertDto[];
    render(<SystemAlerts alerts={alerts} />);
    expect(screen.getByRole('alert')).toHaveClass('ant-alert-warning');
  });
});

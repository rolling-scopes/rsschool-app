import { render } from '@testing-library/react';
import CountBadge from './CountBadge';

// CountBadge wraps antd Badge and applies inline styles based on `status`.
// Antd renders the count inside a sup with class `ant-badge-count`, which is
// where the style is applied.
function getBadgeCount(container: HTMLElement) {
  return container.querySelector('.ant-badge-count') as HTMLElement | null;
}

describe('CountBadge', () => {
  it('renders counts and applies mapped and unmapped status styles', () => {
    const { container, rerender } = render(<CountBadge count={5} />);
    expect(container.textContent).toContain('5');

    rerender(<CountBadge count={3} status="default" showZero />);
    let sup = getBadgeCount(container);
    expect(sup).not.toBeNull();
    expect(sup).toHaveStyle({ backgroundColor: '#f0f2f5', color: 'rgba(0, 0, 0, 0.45)' });

    rerender(<CountBadge count={3} status="processing" showZero />);
    sup = getBadgeCount(container);
    expect(sup).not.toBeNull();
    expect(sup).toHaveStyle({ backgroundColor: '#e6f7ff', color: '#1677ff' });

    rerender(<CountBadge count={3} status="success" showZero />);
    sup = getBadgeCount(container);
    expect(sup).not.toBeNull();
    // none of the preset colors should be applied
    expect(sup).not.toHaveStyle({ backgroundColor: '#f0f2f5' });
    expect(sup).not.toHaveStyle({ backgroundColor: '#e6f7ff' });

    rerender(<CountBadge count={0} showZero status="default" />);
    sup = getBadgeCount(container);
    expect(sup).not.toBeNull();
    expect(sup?.textContent).toContain('0');
  });
});

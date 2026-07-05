import { render } from '@testing-library/react';
import CountBadge from './CountBadge';

// CountBadge wraps antd Badge and applies inline styles based on `status`.
// Antd renders the count inside a sup with class `ant-badge-count`, which is
// where the style is applied.
function getBadgeCount(container: HTMLElement) {
  return container.querySelector('.ant-badge-count') as HTMLElement | null;
}

describe('CountBadge', () => {
  it('renders the provided count', () => {
    const { container } = render(<CountBadge count={5} />);
    expect(container.textContent).toContain('5');
  });

  it('applies the default-status styling', () => {
    const { container } = render(<CountBadge count={3} status="default" showZero />);
    const sup = getBadgeCount(container);
    expect(sup).not.toBeNull();
    expect(sup).toHaveStyle({ backgroundColor: '#f0f2f5', color: 'rgba(0, 0, 0, 0.45)' });
  });

  it('applies the processing-status styling', () => {
    const { container } = render(<CountBadge count={3} status="processing" showZero />);
    const sup = getBadgeCount(container);
    expect(sup).not.toBeNull();
    expect(sup).toHaveStyle({ backgroundColor: '#e6f7ff', color: '#1677ff' });
  });

  it('applies no extra styling for an unmapped status', () => {
    const { container } = render(<CountBadge count={3} status="success" showZero />);
    const sup = getBadgeCount(container);
    expect(sup).not.toBeNull();
    // none of the preset colors should be applied
    expect(sup).not.toHaveStyle({ backgroundColor: '#f0f2f5' });
    expect(sup).not.toHaveStyle({ backgroundColor: '#e6f7ff' });
  });

  it('renders showZero count of 0', () => {
    const { container } = render(<CountBadge count={0} showZero status="default" />);
    const sup = getBadgeCount(container);
    expect(sup).not.toBeNull();
    expect(sup?.textContent).toContain('0');
  });
});

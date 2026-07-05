/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import { tabRenderer, LabelItem } from './renderers';

// Indirection so the testing-library lint heuristic does not treat the
// `tabRenderer` result as a `render()` return value.
function buildTab(item: LabelItem, activeTab?: string) {
  return tabRenderer(item, activeTab);
}

describe('tabRenderer', () => {
  it('returns the key unchanged', () => {
    expect(buildTab({ key: 'mytab', label: 'My Tab', count: 0 }).key).toBe('mytab');
  });

  it('renders just the label when count is zero', () => {
    render(<div>{buildTab({ key: 'a', label: 'Plain', count: 0 }).label}</div>);

    expect(screen.getByText('Plain')).toBeInTheDocument();
    // no badge sup rendered
    expect(document.querySelector('.ant-badge-count')).toBeNull();
  });

  it('renders a count badge alongside the label when count > 0', () => {
    const { container } = render(<div>{buildTab({ key: 'a', label: 'With Count', count: 7 }).label}</div>);

    expect(screen.getByText('With Count')).toBeInTheDocument();
    const badge = container.querySelector('.ant-badge-count');
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toContain('7');
  });

  it('uses processing status when the tab is active', () => {
    const { container } = render(<div>{buildTab({ key: 'a', label: 'Active', count: 3 }, 'a').label}</div>);

    const badge = container.querySelector('.ant-badge-count') as HTMLElement;
    expect(badge).toHaveStyle({ backgroundColor: '#e6f7ff' });
  });

  it('uses default status when the tab is not active', () => {
    const { container } = render(<div>{buildTab({ key: 'a', label: 'Inactive', count: 3 }, 'b').label}</div>);

    const badge = container.querySelector('.ant-badge-count') as HTMLElement;
    expect(badge).toHaveStyle({ backgroundColor: '#f0f2f5' });
  });
});

/* eslint-disable testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import { tabRenderer, LabelItem } from './renderers';

vi.mock('antd', () => ({
  Badge: ({ count, style }: { count: number; style: React.CSSProperties }) => (
    <sup className="ant-badge-count" style={style}>
      {count}
    </sup>
  ),
  Space: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
}));

// Indirection so the testing-library lint heuristic does not treat the
// `tabRenderer` result as a `render()` return value.
function buildTab(item: LabelItem, activeTab?: string) {
  return tabRenderer(item, activeTab);
}

describe('tabRenderer', () => {
  it('returns the key and renders each count and active state', () => {
    expect(buildTab({ key: 'mytab', label: 'My Tab', count: 0 }).key).toBe('mytab');

    render(
      <div>
        {buildTab({ key: 'a', label: 'Plain', count: 0 }).label}
        {buildTab({ key: 'b', label: 'With Count', count: 7 }).label}
        {buildTab({ key: 'c', label: 'Active', count: 3 }, 'c').label}
        {buildTab({ key: 'd', label: 'Inactive', count: 3 }, 'other').label}
      </div>,
    );

    expect(screen.getByText('Plain')).toBeInTheDocument();
    expect(screen.getByText('With Count')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Active').querySelector('.ant-badge-count')).toHaveStyle({
      backgroundColor: '#e6f7ff',
    });
    expect(screen.getByText('Inactive').querySelector('.ant-badge-count')).toHaveStyle({
      backgroundColor: '#f0f2f5',
    });
  });
});

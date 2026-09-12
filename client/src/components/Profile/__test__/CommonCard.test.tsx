import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import CommonCard from '../CommonCard';

vi.mock('@ant-design/icons/EditOutlined', () => ({ default: () => null }));
vi.mock('antd', () => {
  const Empty = ({ description }: { description?: ReactNode }) => <div>{description ?? 'No data'}</div>;
  Empty.PRESENTED_IMAGE_SIMPLE = 'simple';

  return {
    Card: ({ title, children }: { title: ReactNode; children: ReactNode }) => (
      <article>
        {title}
        {children}
      </article>
    ),
    Empty,
    Typography: { Title: ({ children }: React.PropsWithChildren) => <h2>{children}</h2> },
  };
});

describe('CommonCard', () => {
  it('renders content and the empty fallback', () => {
    const { rerender } = render(<CommonCard title="Test" icon={<i>Icon</i>} content={<p>Card body</p>} />);

    expect(screen.getByRole('heading', { name: 'Icon Test' })).toBeInTheDocument();
    expect(screen.getByText('Card body')).toBeInTheDocument();

    rerender(<CommonCard title="Test" icon={<i>Icon</i>} content={null} noDataDescription="Nothing here" />);

    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });
});

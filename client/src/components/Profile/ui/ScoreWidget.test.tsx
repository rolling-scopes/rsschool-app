import { render, screen } from '@testing-library/react';
import { ScoreWidget } from './ScoreWidget';

vi.mock('antd', () => ({
  Tag: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
  theme: { useToken: () => ({ token: { colorBgSpotlight: '#000' } }) },
  Typography: { Text: ({ children }: React.PropsWithChildren) => <span>{children}</span> },
}));

describe('ScoreWidget', () => {
  it('renders positive and zero scores', () => {
    const { rerender } = render(<ScoreWidget score={42} />);

    expect(screen.getByText('Score:')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();

    rerender(<ScoreWidget score={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
